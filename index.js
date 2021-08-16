const puppeteer = require('puppeteer');

module.exports = (async (imageUrl, callback) => {
	const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
	const page = await browser.newPage();
	await page.goto('https://www.google.com/searchbyimage?image_url=' + encodeURIComponent(imageUrl));
	let images;
	images = await page.evaluate(() => {
		let span = 5; //this const might be variable; last time it worked with 4, now 5.
		const getres = (el) => {
			const bodyspan = el.querySelectorAll("div div div span");
			span = 5;
			
			if(bodyspan.length < 4){
				span = 0;
				return "No Res Found";
			}
			if(bodyspan.length < 6){ //if span has less than 5 bodyspans, set span to 3 or 2. else leave it at 5
				span = bodyspan[2] ? 2 : bodyspan[3] ? 3 : 0
				if(bodyspan.length < 4 || span == 0){
					span = 0;
					return "No Res Found";
				}
			}
			if(bodyspan[span].innerHTML == "Similar"){ //if span's content is "Similar", go to next span. Might have to do this with "Cached" as well.
				span++;
			}
			return bodyspan[span].innerHTML.replace(/\ —\ /g, "").replaceAll(/<\/?span.*?>/g, ""); //removes emdash and spans
		}
		//what are the dudes at google doing? the html is inconsistent as heck.
		const getdesc = (el) => {
			const bodyspan = el.querySelectorAll("div div div span");
			if(span == 0) return "No Desc Found";
			//if res has a span, it has a date.
			if (bodyspan[span].innerHTML.includes("</span>")) {
				//if res has a span amd if the div has more than 2 spans, desc has its own span. .match...length finds count of span end tags in the div's innerhtml.
				if (bodyspan[span].parentElement.innerHTML.match(/<\/span>/g || []).length > 2) { 
					return bodyspan[span+1].innerHTML.replaceAll(/(\/?em>|&nbsp;)/g, "").replaceAll(/&amp;/g, "&") //the desc span is at index 6 of bodyspan. removes bold tags and certain common entities.
				}
			}
			else {
				//if res has a span and the div has more than 1 span, desc has its own span.
				if (bodyspan[span].parentElement.innerHTML.match(/<\/span>/g || []).length > 1) {
					return bodyspan[span+1].innerHTML.replaceAll(/(<\/?em>|&nbsp;)/g, "").replaceAll(/&amp;/g, "&") //here, the desc span is at index 5 of bodyspan. removes bold tags and certain common entities.
				}
			}
			return bodyspan[span].parentElement.innerHTML.replaceAll(/(\/?em>|&nbsp;|<\/?span.*>)/g, "").replaceAll(/&amp;/g, "&") //the desc doesn't have its own span and exists in the div's innerHTML. takes the div's innerHTML and removes the res span.
		}
		return Array.from(document.body.querySelectorAll('div div a h3')).slice(3) //this queryselector is necessary to get only the individual search result elements
			.map(e => e.parentNode.parentNode.parentNode.parentNode) //el is the node for the div embodying the two divs that hold url/title and description
			.map(el => ({
				res: getres(el),
				desc: getdesc(el),
				title: el.childNodes[0].childNodes[0].childNodes[0].querySelector("h3").innerHTML,
				url: el.childNodes[0].childNodes[0].childNodes[0].href,
				imgurl: el.querySelector("g-img img") ? el.querySelector("g-img img").src : "No Image",
			}))
	})
	callback(images, imageUrl);
	await browser.close();
});