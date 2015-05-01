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