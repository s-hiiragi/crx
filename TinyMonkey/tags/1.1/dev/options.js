/* TODO:
 *     ・変更がある場合、beforeunloadで確認する？
 *     ・SITEINFOが増えた場合、ページ分けなどをする必要がある
 *     ・SITEINFO検索用のフィルタで、titleのみにマッチするような仕組みを用意する
 *     ・SITEINFOが増えた時、縦スクロールバーが表示され、URLの開くボタンが折り返されてしまう
 *       (スクロールバーの幅を考慮していない)
 *     ・更新ボタンを押すまで、SITEINFOの削除をしないように変更するか？
 */

bg.startup(function(){
	bg.get_all_siteinfo(null, function(res){
		$(function() {
			main(res.SITEINFO);
		});
	});
});

function main(SITEINFO) {
	// スタイルの調整
	$('#SITEINFO').find('.url').parent().removeSpaces();
	$(window).resize(function() {
		$('#SITEINFO .si').find('.url').fullyExtendWidth();
	});
	
	// ユーザーインターフェースの準備
	
	$('#common-commands').removeSpaces()
		.find('.filter').bind('input', filter_si).end()
		.find('.order').change(change_order).end()
		.find('.add-si').click(add_si).end()
		.find('.update-all-si').click(update_all_si).end()
		.find('.inexport').click(toggle_inexport_form).end();
	
	$('#inexport-form')
		.find('.import').click(on_import).end()
		.find('.export-unformatted').click(export_unformatted_siteinfo).end();
	
	const si_temp = $('#SITEINFO .si-temp')
		.find('.title, .url, .code').bind('input', on_si_before_update).end()
		.find('.open-url').click(on_open_url).end()
		.find('.update').click(on_si_update).end()
		.find('.remove').click(on_si_remove).end()
		.find('.reload').click(on_si_reload).end()
		.find('textarea').adjustHeight().end()
		.find('.commands').removeSpaces().end();
	
	const silent_remove = $('#common-commands .silent-remove').get(0);
	
	// すべてのSITEINFOの編集フォームを追加
	for (var id in SITEINFO) {
		add_si(null, id, SITEINFO[id]);
	}
	
	
	
	
	function filter_si(evt) {
		var si_set = $('#SITEINFO .si')
			.removeClass('hidden');
		var matched_cnt = $('#common-commands .count-of-matched')
				.text(''), 
			all_len = si_set.length;
		
		var m = /^\s*(?:\[([^\[\]]+)\])?(.*)$/.exec(evt.target.value), 
			options = m[1], 
			keyword = m[2];
		if (keyword) {
			var unmatched;
			if (options === '!') {
				unmatched = si_set.filter(function() {
						var text = $(this).find('.title').val()
							+ $(this).find('.url').val()
							+ $(this).find('.code').val();
						return (text.indexOf(keyword) !== -1);
					});
			} else {
				unmatched = si_set.filter(function() {
						var text = $(this).find('.title').val()
							+ $(this).find('.url').val()
							+ $(this).find('.code').val();
						return (text.indexOf(keyword) === -1);
					});
			}
			unmatched.addClass('hidden');
			matched_cnt.text('(' + (all_len - unmatched.length) + ' matched)');
		}
	}
	
	var asc_comparator = function(a_elt, b_elt, name) {
			var a = $(a_elt).formValues(name), 
				b = $(b_elt).formValues(name);
			return (a < b ? -1 : (a > b ? 1 : 0));
		}, 
		desc_comparator = function(a_elt, b_elt, name) {
			var a = $(a_elt).formValues(name), 
				b = $(b_elt).formValues(name);
			return (a > b ? -1 : (a < b ? 1 : 0));
		};
	var comparators = {
		'date-desc': function(a_elt, b_elt) {
			var a = new Date(Number($(a_elt).formValues('id'))), 
				b = new Date(Number($(b_elt).formValues('id')));
			return (a > b ? -1 : (a < b ? 1 : 0));
		}, 
		'date-asc': function(a_elt, b_elt) {
			var a = new Date(Number($(a_elt).formValues('id'))), 
				b = new Date(Number($(b_elt).formValues('id')));
			return (a < b ? -1 : (a > b ? 1 : 0));
		}, 
		'title-asc': function(a, b) {
			return asc_comparator(a, b, 'title');
		}, 
		'title-desc': function(a, b) {
			return desc_comparator(a, b, 'title');
		}, 
		'url-asc': function(a, b) {
			return asc_comparator(a, b, 'url');
		}, 
		'url-desc': function(a, b) {
			return desc_comparator(a, b, 'url');
		}
	};
	
	function change_order(evt) {
		var order = evt.target.value;
		if (order === 'do-nothing') { return; }
		
		console.log('sort ' + order, comparators[order]);
		
		$('#SITEINFO .si').sortElements(comparators[order]);
	}
	
	function add_si(evt, id, values) {
		var si = si_temp.clone(true)
			.removeAttr('id')
			.removeClass('dom-template')
			.addClass('si');
		
		var is_new = false;
		if (arguments.length === 1) {
			// 新規IDを割り振る
			si.find('.id').val(Date.now());
			is_new = true;
		} else {
			si.formValues($.extend(values, {id: id}));
		}
		
		si.appendTo('#SITEINFO')
			// スタイルの調整
			.find('.url').fullyExtendWidth().end()
			.find('textarea').adjustHeight().end();
		
		if (is_new) {
			si.find('.title').focus();
		}
	}
	
	function update_all_si(evt) {
		var modified_si_elts = $('#SITEINFO .si')
			.filter(function() {
				return ($(this).find('.update:not(:disabled)').length === 1);
			})
			.find('.update:not(:disabled)').attr('disabled', 'disabled').end();
		
		var si_set = {};
		modified_si_elts.each(function() {
			var values = $(this).formValues();
			si_set[values.id] = $.shrink(values, 'id');
		});
		
		bg.update_siteinfo_set({set: si_set});
	}
	
	function toggle_inexport_form(evt) {
		var form = $('#inexport-form');
		if (form.hasClass('opened')) {
			form.slideUp(300, function() {
					$(evt.target).removeClass('opened');
				});
		} else {
			// 開く時にSITEINFOのJSONデータをフォームに貼り付ける
			bg.export_siteinfo(null, function(res){
				form.find('.data').val(res.data);
				
				$(evt.target).addClass('opened');
				form.slideDown(300);
			});
		}
		form.toggleClass('opened');
	}
	
	function on_import(evt) {
		var values = $('#inexport-form').formValues();
		bg.import_siteinfo(values, function() {
			
			// 全取得してUIに反映する必要がある
			
		});
	}
	
	function export_unformatted_siteinfo(evt) {
		bg.export_siteinfo({unformatted: true}, function(res) {
			$('#inexport-form').find('.data').val(res.data);
		});
	}
	
	
	
	
	function on_si_before_update(evt) {
		// TODO:
		//     ・class="modified"を付与し、この編集判定ハンドラを要素からデタッチする
		//       次にupdateされたときに、再度ハンドラを設定する
		$(this).parents('.si').find('.update').removeAttr('disabled');
	}
	
	function on_open_url(evt) {
		var url = $(this).siblings('.url').val();
		window.open(url);
	}
	
	function on_si_update(evt) {
		$(this).attr('disabled', 'disabled');
		
		var si = $(this).parents('.si'), 
			values = si.formValues();
		bg.update_siteinfo({id: values.id, values: $.shrink(values, 'id')});
	}
	
	function on_si_remove(evt) {
		var si = $(this).parents('.si');
		var values = si.formValues();
		
		var re_empty = /^\s*$/, 
			re_url_empty = /^(?:https?:\/\/)?$/;
		
		var is_empty = (
				re_empty.test(values.title)
				&& re_url_empty.test(values.url)
				&& re_empty.test(values.code)
			);
		
		// 編集フォームが空でない & 削除確認ありの時のみ削除確認する
		if (!is_empty && !silent_remove.checked) {
			if (!confirm('"' + values.title + '" を本当に削除しますか？')) return;
		}
		
		si.remove();
		bg.remove_siteinfo({id: values.id});
	}
	
	function on_si_reload(evt) {
		$(this).siblings('.update').attr('disabled', 'disabled');
		
		var si = $(this).parents('.si');
		bg.get_siteinfo({
			id: si.formValues('id')
		}, function(res) {
			si.formValues(res.values)
				// スタイルの調整
				.find('.url').fullyExtendWidth().end()
				.find('textarea').adjustHeight().end();
		});
	}
}
