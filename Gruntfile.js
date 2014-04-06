module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        files: {
          'public/css/styles.css': 'src/styles.scss'
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
          'public/js/application.min.js': ['src/application.js']
        }
      }
    },
    copy: {
      dist: {
        files: [{
          cwd: 'bower_components/bootstrap/dist/',
          expand: true,
          src: ['**'],
          dest: 'public/'
        }, {
          expand: true,
          cwd: 'bower_components/angular/',
          src: ['**.min.js', '**.map'],
          dest: 'public/js'
        },
        {
          expand: true,
          cwd: 'bower_components/jquery/dist/',
          src: ['**.min.js', '**.map'],
          dest: 'public/js'
        }]
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
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('dev', ['sass', 'jshint']);

  grunt.registerTask('default', ['jshint', 'uglify', 'sass', 'copy']);
};