module.exports = function(grunt){
	grunt.initConfig({

		concat: {
			dist:{
				src: 'builds/*.js',
				dest:'js/script.js'

			}
		}
	});
grunt.loadNpmTasks('grunt-contrib-concat');

};