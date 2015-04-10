module.exports = function(grunt) {

  grunt.initConfig({
    jade: {
      compile: {
        options: {
          data: {root:'',input:"",results:""},
          pretty: true
        },
        files: [{
          expand:true,
          cwd:"public/jade/",
          src: ["*.jade"],
          dest:'public/',
          ext:'.html'
        }]
      }
    },
    watch: {
      jade:{
        files:["public/jade/*.jade"],
        tasks:["jade"]
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

  grunt.registerTask('default', ['express:dev','watch']);

};