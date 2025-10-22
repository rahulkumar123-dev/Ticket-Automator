import requests, os ,traceback
from datetime import datetime
from dotenv import load_dotenv
from elasticsearch import Elasticsearch, helpers
from ticket_field_mapping_with_type import FIELD_MAPPING
from utc_ist_converter import utc_to_ist,ist_to_utc
from TM_field_to_snow_field_mapping import mapping
from mongodb_connect import get_last_updated_date, set_last_updated_date
from get_consul_value import get_consul_value_by_key


snow_BaseUrl=get_consul_value_by_key('snow_BaseUrl')
snow_user=get_consul_value_by_key('snow_user')
snow_pwd=get_consul_value_by_key('snow_pwd')
es_user=get_consul_value_by_key('es_user')
es_pwd=get_consul_value_by_key('es_pwd')
elasticsearch_insert_chunk_size=get_consul_value_by_key('elasticsearch_insert_chunk_size')
incident_table=get_consul_value_by_key('incident_table')
elasticsearch_host_url=get_consul_value_by_key('elasticsearch_host_url')
#elasticsearch_host_url=get_consul_value_by_key('elasticsearch_container_url')


es=Elasticsearch(
    [elasticsearch_host_url],
    basic_auth=(es_user,es_pwd),
    verify_certs=False
)

def get_incremental_data_from_snow():
    last_updated_date=get_last_updated_date()
    utc_last_updated_date=ist_to_utc(last_updated_date)
    print(f"last updated date : {last_updated_date}")
    print(f"utc last updated date : {utc_last_updated_date}")
    url=snow_BaseUrl+f"/api/now/table/{incident_table}"
    #url=snow_BaseUrl+'/api/now/table/incident?sysparm_query=number=INC0010002&sysparm_display_value=true'
    params={
    "sysparm_query": f"sys_updated_on>{utc_last_updated_date}^ORDERBYsys_updated_on",
    "sysparm_fields": ",".join(mapping.values()),
    "sysparm_limit": "200",
    "sysparm_display_value": "true"
    }
    headers={'Accept': 'application/json'}
    response=requests.get(url=url,headers=headers,params=params ,auth=requests.auth.HTTPBasicAuth(snow_user,snow_pwd))
    #snow_tickets_result=response.json()['result']
    snow_tickets_result = response.json().get('result', [])
    print(f"snow tickets_result : {snow_tickets_result}")
    print(f"Fetched {len(snow_tickets_result)} records from ServiceNow.")
    if len(snow_tickets_result)>0:
        max_last_updated_date=calculate_last_updated_date(snow_tickets_result)
        print(f"Max last updated date : {max_last_updated_date}")
    else:
        print(f"No data found in servicenow from last updated date: {last_updated_date}")
        max_last_updated_date=None
    return snow_tickets_result,max_last_updated_date


def snow_ticket_data_to_TM_ticket_data(snow_ticket : dict) -> dict:
    TM_ticket={}
    for field,value in mapping.items():
        snow_ticket_value=snow_ticket.get(value)
        if snow_ticket_value=="" and FIELD_MAPPING[field] in ("keyword","date"):
            TM_ticket[field]=None
        elif isinstance(snow_ticket_value , dict):
            TM_ticket[field] = snow_ticket_value.get("display_value")
        else:
            TM_ticket[field]=snow_ticket_value
    return TM_ticket

def prepare_es_data(tickets):
    for ticket in tickets:
        doc = snow_ticket_data_to_TM_ticket_data(ticket)
        yield {
            "_op_type": "update",
            "_index": "incident-tickets",
            "_id": doc["sys_id"],
            "doc": doc,
            "doc_as_upsert": True
        }

def calculate_last_updated_date(snow_tickets_data : list) -> str:
    max_last_updated_date=None
    for ticket in snow_tickets_data:
        current_date_obj=datetime.strptime(ticket.get('sys_updated_on'),'%Y-%m-%d %H:%M:%S')
        if not max_last_updated_date or current_date_obj>max_last_updated_date:
            max_last_updated_date=current_date_obj
    return max_last_updated_date.strftime('%Y-%m-%d %H:%M:%S')


#result=es.index(index="incident-tickets",id=ticket_dict_for_es["sys_id"], document=ticket_dict_for_es)
#print(f"elasticsearch data insertion result: {result['result']}")
try:
    snow_data,max_last_updated_date=get_incremental_data_from_snow()
    if len(snow_data)>0:
        actions = prepare_es_data(snow_data)
        chunk_size = int(elasticsearch_insert_chunk_size)
        success_count = created_count = updated_count = noop_count = 0
        failed_actions = []

        # ✅ streaming_bulk gives detailed info per doc (without blocking)
        for success, info in helpers.streaming_bulk(
            es,
            actions,
            chunk_size=chunk_size,
            raise_on_error=False,
            raise_on_exception=False  # ⚡ prevents stream stop on single failure
        ):
            if not success:
                failed_actions.append(info)
                continue

            success_count += 1

            # ✅ Extract actual result safely — 'update' key wraps the info
            result = (
                info.get("update", {}).get("result") or
                info.get("index", {}).get("result") or
                info.get("create", {}).get("result") or
                info.get("result", "")
            )

            if result == "created":
                created_count += 1
                # ⚡ Optional: perform extra action for new inserts
                # send_notification(info.get("_id"))
            

            elif result == "updated":
                updated_count += 1
            elif result == "noop":
                noop_count += 1  # ✅ separate count for "no change"
    
        print("Bulk upsert complete.")
        print(f"  ✅ Success: {success_count}")
        print(f"  ➕ Created: {created_count}")
        print(f"  ♻️  Updated: {updated_count}")
        print(f"  🔸 No-Op: {noop_count}")
        print(f"  ❌ Failed: {len(failed_actions)}")

        if failed_actions:
            print("Some documents failed to upsert:")
            for f in failed_actions:
                print(f"  - {f}")
        else:
            set_last_updated_date(max_last_updated_date)
    else:
        print("No action performed on elasticsearch since no data found from service-now")
except Exception as e:
    print(f"Elasticsearch bulk upsert operation failed for all data: {e}")
    traceback.print_exc()


es.indices.refresh(index="incident-tickets")
res=es.search(index='incident-tickets',query={"match_all": {}},size=10)
print(f"Fetched all data from elasticsearch : {res}")


