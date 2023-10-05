<script>
	import PapaParse from 'papaparse'
	let phrase_options = ["Looking good today!",
	"You're awesome",
	"Working hard or hardly working, amirite?",
	"Keep up the good work!",
    "Work work, money made Champagne life, high on display (AC-DC)",
    "Let's work, be proud, stand tall, touch the clouds (Mick Jagger)",
"Never done, never done, A girl's work is never done (The Chordettes)",
"And I'll be taking care of business (every day), Taking care of business (every way), I've been taking care of business (it's all mine), Taking care of business and working overtime, work out"
]

	let phrase = phrase_options[Math.floor(Math.random() * phrase_options.length)];
	let message = "";
	let ODnum="";
	let href='';

	let myfile;

	let csvOutput;
	let total=0;
	let allowedFileExtensions = ['csv'];
	function create_output(data) {

		const output=[]
		ODnum=parseInt(ODnum);
		let prevNDF=data[0]["NDF #"];
		let NDF = prevNDF
		for (let i = 0; i < data.length; i++) {
			NDF = data[i]["NDF #"];
			if (NDF != prevNDF) {
				output.push(
				{
					"1":data[i-1].Date, 
					"2":"OD-"+ODnum,
					"3":"20000", 
					"17":"",
					"18":"",
					"19":data[i-1]["NDF #"],
					"5":data[i-1]["DESC 1"],
					"6":"",
					"11":"",
					"4":"",
					"8":"",
					"9":Math.round(total*100)/100,

				})
				ODnum+=1;
				prevNDF=NDF;
				total=0;

			} else {

				total+=parseFloat(data[i][" CHF Amount "].replace(',','').replace("'", ""));

			}
			output.push(
				{
					"1":data[i].Date, 
					"2":"OD-"+ODnum,
					"3":data[i]["Expense Account"], 
					"17":"",
					"18":"",
					"19":"",
					"5":data[i]["DESC 1"],
					"6":data[i]["DESC 2"],
					"11":data[i]["Donors"]+"/"+data[i]["Project"]+"/"+data[i]["Country"],
					"4":"",
					"8":"",
					"9":data[i][" CHF Amount "],

				})
		}
		csvOutput = PapaParse.unparse(output);
		message="Your CSV is ready!"
		href=encodeURI('data:text/csv;charset=utf-8,'+csvOutput)
	}
	function uploadFile(myfile) {

		
		const file = myfile.files[0];

		const fileExtensionArray = file.type.split("/");
		const fileExtension = fileExtensionArray[fileExtensionArray.length-1];

		if (fileExtension.includes('csv') ) {

			const csvData = PapaParse.parse(
				file,
				
				{	
					header:true,
					complete: (results) => {
						message="working..."
						create_output(results.data)
								}
				}
			);
			
		} else {
			message = "Not an allowed file type"
		}
	}
</script>

<main>
	<div class=upperleft>
		<a href="https://tech-aly.com" target="_blank">
			<p>Tech-aly</p>
		</a>
	</div>
	<h1>Expense Report Cleanup</h1>
	<h2>{phrase}</h2>
	<h2>Let's cleanup that report</h2>
	First ODnum:
	<input bind:value={ODnum} />
	<br>
		<input 
		bind:this={myfile}
		on:change={uploadFile(myfile)} 
		type="file" 
	/>
		{#if message}
			<p>{message}</p>
		{/if}
		{#if csvOutput}
		<button on:click={csvOutput}><a href={href} download="output.csv">Download</a></button>
		{/if}

		</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
		font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
		color:#FFA55A;

	}

	h1 {
		color: darkcyan;
		font-size: 2em;
		font-weight: 400;
	}
	h2 {
		color: darkcyan;
		font-size: 1.5em;
		font-weight: 300;
	}
	p {
		font-size:1.2em;
		color:#FFA55A;
	}


	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
	.upperleft {
		float: left;
		position:absolute;
		border-color:#FFA55A;
		border-style:solid;
		border-radius:1px;
	}
</style>