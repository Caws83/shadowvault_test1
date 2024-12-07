# How to add a new Host (Farm Provider)

1 config/constants/contracts.ts
Add 	masterChef
	factory (if different)
	router (if different)

2 config/abis/tokennameChef.json (like corisChef.json)
	Add the ABI File/info

3 config/contants/tokens.ts
	Add payout token as well as any quote and farm tokens 

4 config/constants/hosts.ts
	Add a new entry

5 config/constants/dex.ts
	If a custom DEX is used add entry

6 config/constants/farms.ts
	Add the new farm config to the concat array

7 config/constants/farms/HOSTNAME.ts (example coris.ts)
	Add a new farm config under ( at least token/BNB )

9 state/farms/hooks.ts
	Add the token / BNB farm ID under usePollCoreFarmData

14 public/images/tokens
	Add images for the tokens to  using the token address as the filename. in .png format
	( all UPPERCASE with lowercase .png )
