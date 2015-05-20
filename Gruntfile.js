module.exports = function(grunt) {

  grunt.initConfig({
    jade: {
      compile: {
        options: {
          data: {dev:true},
          pretty: true
        },
        files: [{
          expand:true,
          cwd:"views/",
          src: ["*.jade"],
          dest:'public/',
          ext:'.html'
        },
        {
          expand:true,
          cwd:"views/partials/",
          src: ["*.jade"],
          dest:'public/partials/',
          ext:'.html'
        }]
      },
       release: {
        options: {
          data: {dev:false},
          pretty: true
        },
        files: [{
          expand:true,
          cwd:"views/",
          src: ["*.jade"],
          dest:'public/',
          ext:'.html'
        },
        {
          expand:true,
          cwd:"views/partials/",
          src: ["*.jade"],
          dest:'public/partials/',
          ext:'.html'
        }]
      }
    },
    watch: {
      jade:{
        files:["views/*.jade","views/partials/*.jade"],
        tasks:["jade:compile"]
      }
    },
    uglify:{
      built:{
        files:{
          "public/dist/main.min.js":['public/scripts/app.js',
          'public/scripts/controllers.js','public/scripts/resultCtrl.js',
          'public/scripts/services.js']
        }
      }
    },
    express:{
      dev:{
        options:{
          script:'index.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['express:dev','watch']);
  grunt.registerTask('release',['jade:release','uglify:built']);

};