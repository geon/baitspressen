"use strict";

const fs = require('fs');

const headlines = fs
	.readFileSync('headlines.txt')
	.toString()
	.split("\n");

const maxSampleLength = 12;
const predictionsBySample = new Map();
headlines
	.forEach(headline => {

		// Start with the empty string.
		let sampleStart = 0;
		let sampleEnd = 0;
		while (sampleStart < headline.length) {

			const sample = headline.slice(sampleStart, sampleEnd);
			const next = headline[sampleEnd];

			let predictions = predictionsBySample.get(sample);
			if (!predictions) {

				predictions = new Map();
				predictionsBySample.set(sample, predictions);
			}

			predictions.set(
				next,
				(predictions.get(next) || 0) + 1
			);

			// Walk the `sampleEnd` forward to the end of the `headline`,
			// then do the same with the `sampleStart`.
			if (sampleEnd < headline.length) {

				++ sampleEnd;

			} else {

				++ sampleStart;
			}

			// Make the `sampleStart` follow the `sampleEnd` so the
			// `maxSampleLenght` is not exeeded.
			if (sampleEnd - sampleStart > maxSampleLength) {

				++ sampleStart;
			}
		}
	});

// console.log(sampleCount.size);


while (true) {

	let generated = '';
	outer:
	while (true) {

		// Get the last `maxSampleLength` chars.
		const sample = generated.substr(-maxSampleLength);

		const predictions = predictionsBySample.get(sample);

		if (!predictions) {

			break;
		}

		let sumCounts = 0;
		for(const count of predictions.values()) {
			sumCounts += count
		}

		for(const [next, count] of predictions.entries()) {

			if (Math.random() <= count/sumCounts) {

				if (!next) {

					break outer;
				}

				generated += next;
				break;
			}

			sumCounts -= count;
		}
	}

	console.log(generated);
}
