module.exports = function(grunt){
	grunt.initConfig({

		concat: {
			options: {
				separator:'\n\n //------------------------>\n',
				banner:'\n\n //--------------->\n\n'
			},
			dist:{
				src: 'builds/*.js',
				dest:'js/script.js'

			}
		},

		watch: {
			options:{
				spawn:false,
				livereload:true
			},
			scripts:{
				files:['views/**/*.html',
				'builds/*.js',
				'js/controllers/*.js',
				'css/**.css'
				],
			tasks:['concat']
		}

		}
	}); 
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-watch');

grunt.registerTask('default', ['concat', 'watch']);

};