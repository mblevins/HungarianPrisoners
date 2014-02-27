'use strict';

module.exports = function(grunt) {
    
    // Project configuration.
    
    //camelcase: true,
    //quotemark: true
    //devel: false

    grunt.initConfig({
        jshint: {
          src: ['Gruntfile.js', 'grunttasks/**/.js'],
          options: {
            curly: true,
            eqeqeq: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            unused: "vars",
            strict: true,
            trailing: true,
            boss: true,
            eqnull: true,
            node: true,
            funcscope: true,
            devel: true,
            globals: {
              require: true,
              define: true,
              requirejs: true,
              describe: true,
              expect: true,
              it: true
            }
          }
        },

        runsim: {
            run: {}
        }
    });
    grunt.loadTasks('./grunttasks');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', 'jshint');
};