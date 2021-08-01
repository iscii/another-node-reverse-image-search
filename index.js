const puppeteer = require('puppeteer');

module.exports = (async (imageUrl, callback) => {
	const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
	const page = await browser.newPage();
	await page.goto('https://www.google.com/searchbyimage?image_url=' + encodeURIComponent(imageUrl));

	const images = await page.evaluate(() => {
		return Array.from(document.body.querySelectorAll('div div a h3')).slice(3) //this queryselector is necessary to get only the individual search result elements
			.map(e => e.parentNode.parentNode.parentNode.parentNode) //el is the node for the div embodying the two divs that hold url/title and description
			.map(el => ({
				res: el.querySelectorAll("div div div span")[4].innerHTML.replace(/\ —\ /g, "").replaceAll(/<\/?span.*?>/g, ""), //removes emdash and spans
        		desc: el.querySelectorAll("div div div span")[4].innerHTML.includes("</span>") //if res has a date...
				? el.querySelectorAll("div div div span")[4].parentElement.innerHTML.replaceAll(/(\/?em>|&nbsp;|<\/?span.*>)/g, "").replaceAll(/&amp;/g,"&") //take the div's innerHTML (the desc) and remove the span. else...
				: el.querySelectorAll("div div div span")[5].innerHTML.replaceAll(/(<\/?em>|&nbsp;)/g,"").replaceAll(/&amp;/g,"&"), //take the regular desc location (span)'s innerHTML. other regexes remove bold tags and some other things
				title: el.childNodes[0].childNodes[0].childNodes[0].querySelector("h3").innerHTML,
				url: el.childNodes[0].childNodes[0].childNodes[0].href,
				imgurl: el.querySelector("g-img img").src,
			}))
	})
	callback(images);
	await browser.close();
});