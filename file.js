const fs = require('fs')

// const quote = 'No beauty shines like a diamond in the sun'

// fs.writeFile('./awesome.html', quote, (err) => {
// 	console.log('completed writing awesome.html')
// })

// const quote2 = 'Live More, worry less 😊😊'
// fs.mkdir('./backup', (err) => {
// 	if (err) {
// 		console.log('error creating backup folder')
// 	}
// })

// for (let i = 1; i <= 10; i++) {
// 	fs.writeFile(`./backup/text-${i}.html`, quote2, (err) => {
// 		if (err) {
// 			console.log(err)
// 		} else {
// 			console.log(`completed writing text-${i}.html`)
// 		}
// 	})
// }

// const [, , n] = process.argv
// quote3 = 'Happy New Year'

// for (let i = 1; i <= n; i++) {
// 	fs.writeFile(`./backup/text-${i}.html`, quote3, (err) => {
// 		if (err) {
// 			console.log(err)
// 		} else {
// 			console.log(`completed writing text-${i}.html`)
// 		}
// 	})
// }

// fs.readFile('./backup/text-1.html', 'utf8', (err, data) => {
// 	if (err) {
// 		console.log(err)
// 	} else {
// 		console.log(data)
// 	}
// })

const nicequote = '\nMake everything as simple as possible, but not simpler.'

for (let i = 1; i <= 10; i++) {
	fs.appendFile('./backup/text-1.html', nicequote, (err) => {
		if (err) {
			console.log(err)
		} else {
			console.log(`completed appending text-1.html`)
		}
	})
}
