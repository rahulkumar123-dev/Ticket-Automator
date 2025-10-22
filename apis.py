from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware 
from typing import Optional, List, Dict , Any
from elasticsearch import Elasticsearch,exceptions as es_exceptions
from dotenv import load_dotenv
import os, json
from datetime import datetime
from pydantic import BaseModel
from get_consul_value import get_consul_value_by_key


es_user=get_consul_value_by_key('es_user')
es_pwd=get_consul_value_by_key('es_pwd')
elasticsearch_host_url=get_consul_value_by_key('elasticsearch_host_url')
#elasticsearch_host_url=get_consul_value_by_key('elasticsearch_container_url')

app = FastAPI(title="Ticket Search API", version="1.0")

#Comment this section for docker container
origins = [
    "http://localhost:3000", # The origin for your React app
    "http://localhost:3001",
    "http://localhost:8080",
]

#Comment this section for docker container
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# Initialize Elasticsearch client
es_client = Elasticsearch(
    [elasticsearch_host_url],
    basic_auth=(es_user, es_pwd),
    verify_certs=False,
    request_timeout=10,
    max_retries=3,
    retry_on_timeout=True
)


@app.get("/ticket/{ticket_number}")
def get_ticket_by_number(ticket_number: str):
    """
    Fetch a ticket document by its 'number' field from Elasticsearch.
    """
    try:
        query = {
            "query": {
                "term": {
                    "number": ticket_number  # ✅ Correct field from mapping
                }
            }
        }

        es_search_response = es_client.search(index="incident-tickets", body=query)

        hits = es_search_response.get("hits", {}).get("hits", [])
        if not hits:
            raise HTTPException(status_code=404, detail="Ticket not found")

        ticket_doc = hits[0]["_source"]
        return {"status": "success", "ticket": ticket_doc}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching ticket: {str(e)}")
    

VALID_SORT_FIELDS = {"created_date", "last_updated_date"}
VALID_DATE_FIELDS = VALID_SORT_FIELDS  # same fields are allowed for date filtering

# Response model
class SearchResponse(BaseModel):
    status: str
    total_fetched: int
    next_cursor: Optional[List[Any]] = None
    tickets: List[Dict[str, Any]]
    message: Optional[str] = None


def _parse_search_after_param(raw: Optional[List[str]]) -> Optional[List[Any]]:
    """
    Accept either:
      - repeated params: ?search_after=val1&search_after=val2  -> FastAPI gives ['val1', 'val2']
      - single JSON encoded list: ?search_after=["val1","val2"] -> FastAPI gives ['["val1","val2"]']
    Returns a list of values (strings) or None.
    """
    if not raw:
        return None

    if len(raw) == 1:
        single = raw[0]
        # try parse JSON list
        try:
            parsed = json.loads(single)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            # not JSON; fallthrough to treat as single-element list (invalid)
            pass

    # otherwise raw is already a list of values (repeated params)
    return raw


def _validate_date_str(s: str) -> str:
    """
    Accept 'YYYY-MM-DD' or ISO datetime strings. Return the original string if valid,
    otherwise raise HTTPException(400).
    """
    if not s:
        raise HTTPException(status_code=400, detail="Empty date string")

    # Try isoformat first
    try:
        # Accepts YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS[.ffffff]
        datetime.fromisoformat(s)
        return s
    except ValueError:
        pass

    # Try YYYY-MM-DD explicitly
    try:
        datetime.strptime(s, "%Y-%m-%d")
        return s
    except ValueError:
        raise HTTPException(status_code=400,
                            detail=f"Invalid date format '{s}'. Use YYYY-MM-DD or ISO datetime.")


@app.get("/tickets/search", response_model=SearchResponse)
def search_tickets(
    page_size: int = Query(10, ge=1, le=100, description="Records per page. Default 10, max 100"),
    search_after: Optional[List[str]] = Query(None, description="Cursor for next page: pass repeated params or a JSON list"),
    sort_field: str = Query("last_updated_date", description="Sort field: created_date or last_updated_date"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="asc or desc"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD HH:MM:SS or ISO)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD HH:MM:SS or ISO)"),
    date_field: str = Query("last_updated_date", description="Which date field to apply the date range (created_date or last_updated_date)"),
    filters: Optional[str] = Query(None, description="Comma-separated filters: field=value,field2=value2")
):
    """
    Search tickets with:
      - efficient cursor-based pagination (search_after)
      - sort by created_date or last_updated_date
      - date range filtering on chosen date_field
      - dynamic exact-match filters on keyword fields
    """
    try:
        # Validate sort and date fields
        if sort_field not in VALID_SORT_FIELDS:
            raise HTTPException(status_code=400, detail=f"Invalid sort_field '{sort_field}'. Allowed: {sorted(VALID_SORT_FIELDS)}")
        if date_field not in VALID_DATE_FIELDS:
            raise HTTPException(status_code=400, detail=f"Invalid date_field '{date_field}'. Allowed: {sorted(VALID_DATE_FIELDS)}")

        # Parse and validate search_after
        parsed_cursor = _parse_search_after_param(search_after)
        if parsed_cursor:
            # Expect exactly two elements: [sort_field_value, number]
            if not isinstance(parsed_cursor, list) or len(parsed_cursor) != 2:
                raise HTTPException(status_code=400, detail="search_after must contain two values: [<sort_field_value>, <number>]. Use repeated params or JSON list.")

        # Build filters
        must_clauses = []
        filter_clauses = []

        # Parse filters param (comma-separated key=value)
        if filters:
            for pair in filters.split(","):
                pair = pair.strip()
                if not pair:
                    continue
                if ":" in pair:
                    key, value = pair.split(":", 1)
                elif "=" in pair:
                    key, value = pair.split("=", 1)
                else:
                    raise HTTPException(status_code=400, detail=f"Invalid filter format '{pair}'. Use field=value")
                must_clauses.append({"term": {key.strip(): value.strip()}})

        # Date range
        if start_date:
            start_date = _validate_date_str(start_date)
        if end_date:
            end_date = _validate_date_str(end_date)
        if start_date or end_date:
            range_q = {}
            if start_date:
                range_q["gte"] = start_date
            if end_date:
                range_q["lte"] = end_date
            filter_clauses.append({"range": {date_field: range_q}})

        # Compose bool query
        bool_query = {"must": must_clauses or [{"match_all": {}}], "filter": filter_clauses}

        # Sort (primary = requested date field, secondary = number for stable ordering)
        sort_clause = [
            {sort_field: {"order": sort_order, "unmapped_type": "date"}},
            {"number": {"order": "asc"}}
        ]

        body = {
            "size": page_size,
            "query": {"bool": bool_query},
            "sort": sort_clause
        }

        if parsed_cursor:
            body["search_after"] = parsed_cursor

        # Execute
        resp = es_client.search(index='incident-tickets', body=body)

        hits = resp.get("hits", {}).get("hits", [])
        if not hits:
            return {"status": "success", "total_fetched": 0, "next_cursor": None, "tickets": [], "message": "No tickets found"}

        tickets = [h["_source"] for h in hits]
        # next cursor only if we have full page (otherwise no next page)
        next_cursor = hits[-1].get("sort") if len(hits) == page_size else None

        return {"status": "success", "total_fetched": len(tickets), "next_cursor": next_cursor, "tickets": tickets}

    except es_exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Elasticsearch unreachable")
    except es_exceptions.TransportError as e:
        # transport errors from ES
        raise HTTPException(status_code=502, detail=f"Elasticsearch transport error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        # catchall
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")