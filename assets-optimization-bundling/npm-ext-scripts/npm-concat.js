'use strict';

/**
 * @ Date: 12 - 10 - 2018
 * @ Author: Muniir Gopaul
 * @ Email: mgopaul1@amaris.com | muniirwebarts@gmail.com
 * Retrieving files from directory
 *
 */
import concat from 'concat';
import fs from 'fs';
import path from 'path';

let in_dir = './assets/style/custom-styles/',
	out_dir = './assets/style/uncompressed/',
	CSS_directory_path = path.join(`${in_dir}`);

fs.readdir(CSS_directory_path, (err, files)=> {

	//--> error handling
	if(err){
		return console.log(`Cannot find directory to scan: ${err}`);
	}

	//--> lists all files in the directory
	files.forEach((file)=>{
		console.log(file);
	});

	concat(CSS_directory_path).then((result) => {
		//--> write result to a file
		fs.writeFile(`${out_dir}/\\/custom.uncompressed.css`, result, (err)=> {
			if(err) throw err;
			console.log('File has been saved');
		});

	});


});
