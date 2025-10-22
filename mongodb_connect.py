from pymongo import MongoClient
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os


load_dotenv()
mongodb_user = quote_plus(os.getenv('mongodb_user'))
mongodb_pwd = quote_plus(os.getenv('mongodb_pwd'))
uri = f"mongodb://{mongodb_user}:{mongodb_pwd}@127.0.0.1:27017/?authSource=admin"
mongodbclient = MongoClient(uri, serverSelectionTimeoutMS=5000)

def set_last_updated_date(last_update_date):
    mongodb_database=mongodbclient['tm-db']
    last_update_date_collection=mongodb_database['last_updated_date']
    try:
        update_result=last_update_date_collection.update_one({'ticket_type': 'incident'},{'$set' :{'last_updated_date' : last_update_date}})
        print(f"update result : {update_result}")
        new_last_updated_date=last_update_date_collection.find_one({'ticket_type': 'incident'})
        if update_result.modified_count==1:
            print(f"succesfully updated last updated date in mongodb. New last updated date is : {new_last_updated_date.get('last_updated_date')}")
    except Exception as e:
        print(f"""Error while setting last updated date in Mongodb :
        Info: 
        db name : tm-db 
        collection name : last_updated_date
        ERROR: {e}""")



def get_last_updated_date() -> str:
    mongodb_database=mongodbclient['tm-db']
    last_update_date_collection=mongodb_database['last_updated_date']
    try:
        last_updated_date_obj=last_update_date_collection.find_one({'ticket_type': 'incident'})
        current_last_updated_date=last_updated_date_obj.get('last_updated_date')
        print(current_last_updated_date)
        print(f"succesfully fetched last updated date from mongodb. current last updated date is : {current_last_updated_date}")
    except Exception as e:
        print(f"""Error while setting last updated date in Mongodb :
        Info: 
        db name : tm-db 
        collection name : last_updated_date
        ERROR: {e}""")

    return current_last_updated_date
