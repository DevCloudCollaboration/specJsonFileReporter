
/**
 * Module dependencies.
 */

var mocha = require("mocha")
  , Base = mocha.reporters.Base
  , cursor = Base.cursor
  , color = Base.color
  , fs = require("fs");

/**
 * Expose `SpecJsonFileReporter`.
 */

exports = module.exports = SpecJsonFileReporter;

/**
 * Initialize a new `SpecJsonFileReporter` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function SpecJsonFileReporter(runner) {
  Base.call(this, runner);

  // spec reporter code --------------------------------------------------
  var self = this
    , stats = this.stats
    , indents = 0
    , n = 0;

  function indent() {
    return Array(indents).join('  ')
  }

  runner.on('start', function(){
    console.log();
  });

  runner.on('suite', function(suite){
    ++indents;
    console.log(color('suite', '%s%s'), indent(), suite.title);
  });

  runner.on('suite end', function(suite){
    --indents;
    if (1 == indents) console.log();
  });

  runner.on('pending', function(test){
    var fmt = indent() + color('pending', '  - %s');
    console.log(fmt, test.title);
  });

  runner.on('pass', function(test){
    if ('fast' == test.speed) {
      var fmt = indent()
        + color('checkmark', '  ' + Base.symbols.ok)
        + color('pass', ' %s ');
      cursor.CR();
      console.log(fmt, test.title);
    } else {
      var fmt = indent()
        + color('checkmark', '  ' + Base.symbols.ok)
        + color('pass', ' %s ')
        + color(test.speed, '(%dms)');
      cursor.CR();
      console.log(fmt, test.title, test.duration);
    }
  });

  runner.on('fail', function(test, err){
    cursor.CR();
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
  });

  runner.on('end', self.epilogue.bind(self));

  // JSON reporter code --------------------------------------------------
  var tests = [],
  failures = [],
  passes = [];

  runner.on('test end', function (test) {
    tests.push(test);
  });

  runner.on('pass', function (test) {
    passes.push(test);
  });

  runner.on('fail', function (test) {
    failures.push(test);
  });

  runner.on('end', function () {
    var obj = {
      stats: self.stats,
      tests: tests.map(clean),
      failures: failures.map(clean),
      passes: passes.map(clean)
    };
    
    // Write the JSON result to a file ---------------------------------
    var fd = fs.openSync('./tests/test_output/test-output.json', 'w');
    fs.writeSync(fd, JSON.stringify(obj, null, 2), null, 'utf8');
    fs.closeSync(fd);
  });
}

/**
 * Inherit from `Base.prototype`.
 */

SpecJsonFileReporter.prototype.__proto__ = Base.prototype;


/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration
  }
}