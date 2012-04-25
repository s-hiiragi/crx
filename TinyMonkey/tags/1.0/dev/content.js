bg.startup(function(){
	bg.query_siteinfo({
		url: location.href, 
		ref: document.referrer
	}, function(res) {
		const SITEINFO = res.SITEINFO;
		
		for (var i = 0, l = SITEINFO.length; i < l; ++i) {
			var si = SITEINFO[i];
			
			try {
				new Function(si.code)();
			} catch (e) {
				console.error('script[' + i + ']: ' + e.toString());
			}
		}
	});
});
