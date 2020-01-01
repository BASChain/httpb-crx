# Development Wiki


## development evnironment prepared

```bash
git clone git@github.com:BASChain/httpb-crx.git basexer-crx
cd basexer-crx

npm run deps-install
```

## Usage
> development usage commands

### create i18n fieldset 

```bash
cd basexer-crx
./bin/new-locale-key.sh 

```

input key message 

https://github.com/ipfs-shipyard/ipfs-companion/issues/164#issuecomment-328374052

http://dns.ppn.one:8053/dns-query?name=nbs

{
    "Status": 0, 
    "TC": false, 
    "RD": true, 
    "RA": false, 
    "AD": false, 
    "CD": false, 
    "Question": [
        {
            "name": "nbs.", 
            "type": 1
        }
    ], 
    "Answer": [
        {
            "name": "nbs.", 
            "type": 1, 
            "TTL": 10, 
            "Expires": "Wed, 01 Jan 2020 14:28:21 UTC", 
            "data": "104.238.165.23"
        }
    ], 
    "edns_client_subnet": "221.218.137.134/0"
}


>>>>> huawei.com.

{
    "Status": 0, 
    "TC": false, 
    "RD": true, 
    "RA": true, 
    "AD": false, 
    "CD": false, 
    "Question": [
        {
            "name": "www.huawei.com.", 
            "type": 1
        }
    ], 
    "Answer": [
        {
            "name": "www.huawei.com.", 
            "type": 5, 
            "TTL": 542, 
            "Expires": "Wed, 01 Jan 2020 14:38:31 UTC", 
            "data": "www.huawei.com.akadns.net."
        }, 
        {
            "name": "www.huawei.com.akadns.net.", 
            "type": 5, 
            "TTL": 299, 
            "Expires": "Wed, 01 Jan 2020 14:34:28 UTC", 
            "data": "www.huawei.com.lxdns.com."
        }, 
        {
            "name": "www.huawei.com.lxdns.com.", 
            "type": 1, 
            "TTL": 59, 
            "Expires": "Wed, 01 Jan 2020 14:30:28 UTC", 
            "data": "111.206.179.62"
        }, 
        {
            "name": "www.huawei.com.lxdns.com.", 
            "type": 1, 
            "TTL": 59, 
            "Expires": "Wed, 01 Jan 2020 14:30:28 UTC", 
            "data": "114.112.173.40"
        }
    ], 
    "edns_client_subnet": "221.218.137.0/13"
}