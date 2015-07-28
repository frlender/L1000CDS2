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
          'public/scripts/ctrls/controllers.js',
          'public/scripts/ctrls/resultCtrl.js',
          'public/scripts/ctrls/drugStructureCtrl.js',
          'public/scripts/services/services.js',
          'public/scripts/services/query.js',
          'public/scripts/services/getSearch.js',
          'public/scripts/services/validate.js',
          'public/scripts/services/Local.js',
          'public/scripts/directives.js'
          ]
        }
      }
    },
    express:{
      dev:{
        options:{
          script:'index.js'
        }
      }
    },
    env:{
      dev:{
        NODE_ENV:"dev"
      },
      product:{
        NODE_ENV:"product"
      },
      product2:{
        NODE_ENV:"product2"
      },
      docker:{
        NODE_ENV:"docker"
      },
      test:{
        NODE_ENV:"test"
      }
    },
    run:{
      server:{
        args:[
          'index.js'
        ]
      }
    },
    nodeunit:{
      all:['test/test.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-run');

  grunt.registerTask('default', ['env:dev','express:dev','watch']);
  // grunt.registerTask('release',['jade:release','uglify:built']);
  grunt.registerTask('deploy',['jade:release','uglify:built','env:product','run:server'])
  // different servers from deploy
  grunt.registerTask('deploy2',['jade:release','uglify:built','env:product2','run:server'])
  grunt.registerTask('localDeploy',['jade:release','uglify:built','run:server'])
  grunt.registerTask('testDeploy',['jade:release','uglify:built','env:test','run:server'])
  grunt.registerTask('testProduct',['env:product','nodeunit'])
  grunt.registerTask('testDocker',['env:docker','nodeunit'])
  grunt.registerTask('test',['env:dev','nodeunit'])

};
