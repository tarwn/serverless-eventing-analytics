//TODO: DynamoDB + Dynalite

// import dynalite from 'dynalite';
// import AWS from 'aws-sdk';

// var dynaliteServer = dynalite({createTableMs: 50});

// module.exports.mockDB = () => {

// 	AWS.config.update({
// 		region: env.process.DYNAMODB_REGION,
// 		endpoint: env.process.DYNAMODB_ENDPOINT
// 	});

// 	var dynamodb = new AWS.DynamoDB();

// 	return new Promise((resolve, reject) => {
// 		dynaliteServer.listen(4567, function (err) {
// 			dynamodb.listTables({}).promise()
// 				.catch((err) => { console.log(err) })
// 				.then((data) => {
// 					if (data.TableNames.length === 0) {
// 						return Promise.all([
// 							createResultTable(),
// 							createRulesTable()
// 						]);
// 					}
// 				})
// 				.then((data) => {
// 					setTimeout(() => {
// 						resolve(data[0]);
// 					}, 1000)
// 				})
// 				.catch((err) => { 
// 					console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
// 					reject(err);
// 				});
// 		});
// 	});
// };
