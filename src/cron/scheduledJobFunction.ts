
import cron from 'node-cron';
exports.initScheduledJobs = () => {
	const scheduledJobFunction = cron.schedule("*/10 * * * * *", () => {
		console.log("I'm executed on a schedule!");
		// Add your custom logic here
	});

	scheduledJobFunction.stop();
};
