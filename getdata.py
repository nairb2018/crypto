# This file is used to try to get data from quandl for analysis... 

import quandl
mydata = quandl.get("BITFINEX/BTCUSD")

print mydata[1,:]
