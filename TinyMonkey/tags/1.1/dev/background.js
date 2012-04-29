/* TODO:
 *     ・URLマッチングを正規表現に変更する？(AutoPagerizeのSITEINFOのように)
 */

var SITEINFO = JSON.parse(localStorage.getItem('SITEINFO')) || {};


function save_siteinfo() {
	localStorage.setItem('SITEINFO', JSON.stringify(SITEINFO));
}


bg.startup();
bg.add_methods({
	// URLにマッチするSITEINFOを取得
	query_siteinfo: function(params, callback) {
		var url = params.url;
		
		var si_set = [];
		for (var id in SITEINFO) {
			var si = SITEINFO[id];
			if (url.indexOf(si.url) === 0) {
				si_set.push($.extend(si, {id: id}));
			}
		}
		callback({SITEINFO: si_set});
	}, 
	// 一件のSITEINFOを取得
	get_siteinfo: function(params, callback) {
		callback({
			id: params.id, 
			values: SITEINFO[params.id]
		});
	}, 
	// すべてのSITEINFOを取得
	get_all_siteinfo: function(params, callback) {
		callback({SITEINFO: SITEINFO});
	}, 
	// 一件のSITEINFOを更新(追加 or 上書き)
	update_siteinfo: function(params, callback) {
		SITEINFO[params.id] = params.values;
		localStorage.setItem('SITEINFO', JSON.stringify(SITEINFO));
		callback();
	}, 
	// 複数のSITEINFOをまとめて更新
	update_siteinfo_set: function(params, callback) {
		var si_set = params.set;
		for (var id in si_set) {
			SITEINFO[id] = si_set[id];
		}
		save_siteinfo();
		callback();
	}, 
	// 一件のSITEINFOを削除
	remove_siteinfo: function(params, callback) {
		delete SITEINFO[params.id];
		save_siteinfo();
		callback();
	}, 
	// エクスポート
	export_siteinfo: function(params, callback) {
		var data = JSON.stringify(SITEINFO, null, 2);
		if (!params.unformatted) {
			data = data
				.replace(/\\n/g, '\n      ')
				.replace(/(code"\s*:\s*")/g, '$1\n      ');
		}
		callback({data: data});
	}, 
	// インポート
	import_siteinfo: function(params, callback) {
		var tab = new Array(params.tabsize+1).join(' ');
		var data = params.data
			.replace(/"code"\s*:\s*"((?:[^\"\\]|\\[\s\S])*)"/g, function(m, code) {
				var indent_lev = Infinity;
				var re_ln = /\n(\s*)/g;
				while (true) {
					var m = re_ln.exec(code);
					if (!m) break;
					
					var lev = m[1].replace(/\t/g, tab).length;
					if (lev < indent_lev) indent_lev = lev;
				}
				code = code.replace(new RegExp('\\n\\s{' + indent_lev + '}', 'g'), '\\n')
				if (code.substring(0, 2) === '\\n') { code = code.substring(2); }
				
				return '"code":"' + code + '"';
			});
		var si = JSON.parse(data);
		
		SITEINFO = si;
		save_siteinfo();
		
		callback();
	}
});
