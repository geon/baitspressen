"use strict";

const jsdom = require("jsdom");
const request = require('request-promise');
const fs = require('fs');

// jsdom.env(
// 	'http://www.newsner.com/page/2',
// 	[],
// 	function (err, window) {

// 		const headlines = [];
// 		for(x of window.document.querySelectorAll("a span.h6")) {
// 			headlines.push(x.textContent);
// 		}
// 	}
// );



// jsdom.env(
// 	'http://www.expressen.se/omtalat/?page=2',
// 	[],
// 	function (err, window) {

// 		const headlines = [];
// 		for(x of window.document.querySelectorAll("h2.teaser-headline")) {
// 			headlines.push(x.textContent);
// 		}
// 		console.log(headlines);
// 	}
// );




// jsdom.env(
// 	'http://lajkat.se/page/2',
// 	[],
// 	function (err, window) {

// 		const headlines = [];
// 		for(x of window.document.querySelectorAll("h1.abPostTitle a")) {
// 			headlines.push(x.textContent);
// 		}
// 		console.log(headlines);
// 	}
// );



[
	{
		url: 'http://www.newsner.com/page/',
		selector: 'a span.h6'
	},
	{
		url: 'http://www.expressen.se/omtalat/?page=',
		selector: 'h2.teaser-headline'
	},
	{
		url: 'http://lajkat.se/page/',
		selector: '.medium-8 h1.abPostTitle a'
	}
]
	.map(site => () => {

		let chain = Promise.resolve();
		for (let page = 1; page < 1000; ++page) {

			chain = chain.then(() => {

				return getHeadlines(site, page)
					.then(headlines => {

						headlines
							.forEach(headline => {

								process.stdout.write(headline.trim() + "\n");
							});
					});

			});
		}

		return chain
			.catch(error => {

				console.error(error.stack || error);
			});
	})
	.reduce((soFar, next) => soFar.then(next), Promise.resolve());



function getHeadlines (site, page) {

console.error(site.url + page);
	return readPage(site.url + page)
		.then(window => {

			const headlines = [];
			for(let x of window.document.querySelectorAll(site.selector)) {

				headlines.push(x.textContent);
			}

			if (!headlines.length) {

				throw new Error('No more headlines.');
			}

			return headlines;
		});
}





function readPage(url) {

	return new Promise((resolve, reject) => {

		jsdom.env(url, [], function (error, window) {

				if (error) {

					reject(error);
					return;
				}

				resolve(window);
			}
		);
	});
}
