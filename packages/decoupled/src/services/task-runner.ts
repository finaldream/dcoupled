/**
 * Task Runner Class
 */

import cron from 'cron';
import { config } from 'multisite-config';
import logger from '../logger';

export class TaskRunner {

    public tasks: any[];
    public registedTasks: any[];

    /**
     * TaskRunner constructor
     */
    constructor() {
        this.tasks = [];
        this.registedTasks = [];
    }

    /**
     * Register all tasks defined in current site
     */
    public init() {
        this.tasks = config.get('tasks', []);

        if (Array.isArray(this.tasks) && this.tasks.length > 0) {
            this.tasks
                .filter(
                    (task) =>
                        task.handler && typeof task.handler === 'function' &&
                        task.interval && typeof task.interval === 'string',
            )
                .forEach((task) => this.register(task.interval, task.handler, task.startup));

            logger.info(`TaskRunner.init Registered ${this.registedTasks.length} tasks`);
        } else {
            logger.info(`TaskRunner.init No tasks found`);
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
                start,
                timeZone,
            });

            // Run task immediately after server start-up
            if (startup) {
                onTick();
            }

            this.registedTasks.push(newTask);

            return newTask;
        } catch (error) {
            logger.error(error.message);
        }
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
}

export default new TaskRunner();
