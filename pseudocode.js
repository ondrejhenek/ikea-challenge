// AB testing on product pages


// Determine location to avoid unnecessary computations
if (location == productPage) {
	// First let's attempt to recover the testing variant
	var testingVariant = localStorage.retrieveTestInfo();
	// If the testing varaint was NOT assigned yet, we need to determine it.
	if (testingVariant == undefined) {
		// Let's generate a random value and split it 50:50 between variant A or control
		testingVariant = (getRandomNumberBetween0and1() > 0.5 ? 'A' : 'control';
		// and then save the variant info.
		localStorage.saveTestInfo(testingVariant);
	}
	// in any case now, we have a clear variant assigned (either from local storage or just generated)
	// so we can act upon the variant. If we have variant 'A', then we make the button yellow. Otherwise nothing happens.
	if (testingVariant == 'A'){
		document.querySelector('shoppingBagButton').makeItYellow();
	}
	// And of course we need to track the variant and subsequent activities to determine AB testing winner ;)
	bloomreach.trackTesting();
	bloomreach.trackActivities();
}
