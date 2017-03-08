import * as fs from 'fs';

const headlines = fs
	.readFileSync('headlines.txt')
	.toString()
	.split("\n")
	.map(headline => headline.split(' '));

// headlines = headlines.slice(0, 100);

type MarkovIndex = string | symbol;

type MarkovTree = Map<MarkovIndex, Node>;

type Node = {
	count: number,
	subTree: MarkovTree
};

const start = Symbol('start');
const end = Symbol('end');

function makeMarkovTree (headlines: MarkovIndex[][], maxSampleLength: number) {

	const tree: MarkovTree = new Map();

	headlines
		.forEach(headline => {

			headline.unshift(start);
			headline.push(end);

			const headlineSamples = [];
			let sampleStart = 0;
			let sampleEnd = 1;
			while (sampleStart < headline.length) {

				headlineSamples.push(headline.slice(sampleStart, sampleEnd));

				// Walk the `sampleEnd` forward to the end of the `headline`,
				// then do the same with the `sampleStart`.
				if (sampleEnd < headline.length) {

					++ sampleEnd;

				} else {

					++ sampleStart;
				}

				// Make the `sampleStart` follow the `sampleEnd` so the
				// `maxSampleLength` is not exeeded.
				if (sampleEnd - sampleStart > maxSampleLength) {

					++ sampleStart;
				}
			}

			headlineSamples
				.forEach(headlineSample => {

					let subTree = tree;
					headlineSample
						.forEach(word => {

							let node = subTree.get(word);
							if (!node) {

								node = {
									count: 0,
									subTree: new Map()
								};

								subTree.set(word, node);
							}

							node.count++;
							subTree = node.subTree;
						})
				});
		});

	return tree;
}

const maxSampleLength = 3;
const tree = makeMarkovTree(headlines, maxSampleLength);



// function printTree (subTree: MarkovTree, indentation: string = '') {

// 	subTree
// 		.forEach((node, index) => {

// 			console.log(indentation + index.toString() + ': ' + node.count);
// 			printTree(node.subTree, indentation + "    ");
// 		});
// }

// printTree(tree);

let count = 100;
while (count --) {

	let generated: MarkovIndex[] = [start];
	outer:
	while (true) {

		const sample = generated
			.slice(-(maxSampleLength-1));

		let endTree = getBestMatch(tree, sample);

		const word = pickWeightedRandomWord(endTree);
		if (word == end) {

			break outer;
		}

		generated.push(word);
	}

	console.log(generated.map(x => x.toString()).join(' '));
}


function getBestMatch (tree: MarkovTree, path: MarkovIndex[]) {

	while (path.length) {

		try {

			const bestMatch = getSubTreeByPath(tree, path);
			if (!bestMatch.size) {

				throw new Error('No next word.');
			}
			return bestMatch;

		} catch (error) {

			// Ignore.
		}

		// Retry with shorter path.
		path = path.slice(1);
	}

	throw new Error('No partial match.');
}


function getSubTreeByPath (tree: MarkovTree, path: MarkovIndex[]) {

	let endTree = tree;
	path
		.forEach(word => {

			const node = endTree.get(word);

			if (!node) {
				throw new Error('Path missing.');
			}

			endTree = node.subTree;
		});

	return endTree;
}


function pickWeightedRandomWord (tree: MarkovTree) {

	if (!tree.size) {

		throw new Error('No entries in tree.');
	}

	let sumCounts = 0;

	for(const node of tree.values()) {

		sumCounts += node.count
	}

	for(const [word, node] of tree.entries()) {

		if (Math.random() <= node.count/sumCounts) {

			return word;
		}

		sumCounts -= node.count;
	}

	// Should never reach this far, but the compile doesn't understand probabillity.
	return tree.keys().next().value;
}
