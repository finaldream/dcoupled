/**
 * Task Runner Class
 */

import cron from 'cron';
import { SiteDependent } from '../lib/common/site-dependent';
import { Site } from '../site/site';

export class TaskRunner extends SiteDependent {

    public tasks: any[];
    public registedTasks: any[];

    /**
     * TaskRunner constructor
     */
    constructor(site: Site, tasks?: object[]) {

        super(site);

        this.tasks = tasks || [];
        this.registedTasks = [];

        this.init();

    }

    /**
     * Register all tasks defined in current site
     */
    public init(tasks?: object[]) {

        this.tasks = tasks || this.tasks;

        if (Array.isArray(this.tasks) && this.tasks.length > 0) {
            this.tasks
                .filter(
                    (task) =>
                        task.handler && typeof task.handler === 'function' &&
                        task.interval && typeof task.interval === 'string',
                )
                .forEach((task) => this.register(task.interval, () => task.handler(this.site), task.startup));

            this.logger.debug(`TaskRunner.init Registered ${this.registedTasks.length} tasks`);
        } else {
            this.logger.debug(`TaskRunner.init No tasks found`);
        }

    }

    /**
     * Register new task
     *
     * @param {string|Date} cronTime
     * @param {function} onTick
     * @param {boolean} startup
     * @param {boolean} start
     * @param {string} timeZone
     *
     * Notes
     * - To run once at specific date, can pass a date Object as cronTime
     */
    public register(cronTime, onTick, startup = false, start = true, timeZone = 'Europe/London') {

        try {
            const newTask = new cron.CronJob({
                cronTime,
                onTick,
                start: true,
                runOnInit: startup,
                timeZone,
            });

            this.registedTasks.push(newTask);

            return newTask;
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    public getRunningTasks() {
        return this.registedTasks.filter((task) => task.running);
    }

    /**
     * Start all tasks by its object
     */
    public startAll() {
        this.registedTasks
            .filter((task) => !task.running)
            .forEach((task) => task.start());
    }

    /**
     * Stop all tasks by its object
     */
    public stopAll() {
        this.registedTasks
            .filter((task) => task.running)
            .forEach((task) => task.stop());
    }

    public clearTasks() {
        this.stopAll();
        this.registedTasks = [];
    }

    public destroy() {
        this.clearTasks();
    }
}
