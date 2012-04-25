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
	}
});
