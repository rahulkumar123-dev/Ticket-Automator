from datetime import datetime
from zoneinfo import ZoneInfo

def ist_to_utc(ist_str):
    # Parse IST string into a datetime object (naive)
    dt = datetime.strptime(ist_str, "%Y-%m-%d %H:%M:%S")
    # Attach IST timezone
    ist = dt.replace(tzinfo=ZoneInfo("Asia/Kolkata"))
    # Convert to UTC
    utc_time = ist.astimezone(ZoneInfo("UTC"))
    # Return formatted string
    return utc_time.strftime("%Y-%m-%d %H:%M:%S")


def utc_to_ist(utc_str):
    # Parse UTC string
    dt = datetime.strptime(utc_str, "%Y-%m-%d %H:%M:%S")
    # Attach UTC timezone
    utc = dt.replace(tzinfo=ZoneInfo("UTC"))
    # Convert to IST
    ist_time = utc.astimezone(ZoneInfo("Asia/Kolkata"))
    # Return formatted string
    return ist_time.strftime("%Y-%m-%d %H:%M:%S")