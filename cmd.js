const program = require("commander");

program
    .version('1.0.0')


program.on('--help', function () {
});

program.parse(process.argv);

require("./gulpfile");

function runTask(toRun) {
    const gulp = require('gulp');
    const metadata = { task: toRun };
    const taskInstance = gulp.task(toRun);
    if (taskInstance === undefined) {
        gulp.emit('task_not_found', metadata);
        return;
    }
    const start = process.hrtime();
    gulp.emit('task_start', metadata);
    try {
        taskInstance.apply(gulp);
        metadata.hrDuration = process.hrtime(start);
        gulp.emit('task_stop', metadata);
        gulp.emit('stop');
    } catch (err) {
        err.hrDuration = process.hrtime(start);
        err.task = metadata.task;
        gulp.emit('task_err', err);
    }
}

runTask(program.args[0]);