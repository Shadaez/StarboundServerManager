module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
        dist: {
            files: {
                'public/styles.css' : 'src/styles.scss'
            }
        }
    },
    uglify: {
      options: {
        banner: '/*! <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        mangle: false
      },
      dist: {
        files: {
          'src/application.min.js' : ['src/application.js']
        }
      }
    },
    concat: {
        dist: {
            files: {
                'public/application.min.js' : ['bower_components/jquery/jquery.min.js', 'bower_components/angular/angular.min.js', 'src/application.min.js'] 
            }
        }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/application.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      css: {
        files: "src/*.scss",
        tasks: ['sass']
      },
      js: {
        files: "src/application.js",
        tasks: ['jshint', 'uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('dev', ['sass', 'jshint']);

  grunt.registerTask('default', ['jshint', 'uglify', 'concat' , 'sass']);
};