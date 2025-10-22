from consul import Consul

consul_client=Consul(host="localhost",port=8500)

def get_consul_value_by_key(key : str):
    value=consul_client.kv.get('tm-consul/'+str(key))[1]['Value'].decode()
    return value
