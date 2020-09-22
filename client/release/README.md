mozilla_extension -> folder of the web extension use by the user
source_code -> my code
source_code/modules/ -> library
source_code/release/ -> use to welcome compiled file + some usefull file for release ( just continue reading you will understand )
source_code/src/ -> my code 
package.json & package-lock.json -> library handler / command handler and others things


So they're 2 steps to obtain the final source code ( uptextv.js ) use by the user

1 - compile each files / modules / library in one file ( it use browserify https://en.wikipedia.org/wiki/Browserify )
2 - delete commentary / spaces etc

I created a command that do this thing. Just run 'npm run release' in uptex/
Then in uptex/source_code/release/ you will obtain 2 files : 
	1- uptextv-bundle.js
	2- uptextv.js

'npm run release' also create uptex.zip which is the file you normaly receive
	
uptextv-bundle is the step 1 
uptextv.js is the step 2 ( used in mozilla_extension )


if you need help to understand things feel free to contact me at valentinverst.developer@gmail.com
Good luck and have a good day