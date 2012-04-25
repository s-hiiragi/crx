/* @name         jQuery.hl.js
 * @description  jQuery utility plugins
 */
(function($) {
	$.extend({
		/** オブジェクトからプロパティを削除 (元のオブジェクトは変更しない)
		 * 
		 * @param {object} target  対象オブジェクト
		 * @param {string|string[]} keys  削除するキー配列。1個の場合配列でなくても良い
		 * 
		 * @returns {object}  変更後のオブジェクト(複製)
		 */
		shrink: function(target, keys) {
			if (!(keys instanceof Array) && Object(keys) instanceof String) {
				keys = [keys];
			}
			
			var ret = {};
			for (var k in target) {
				if (target.hasOwnProperty(k)) {
					ret[k] = target[k];
				}
			}
			for (var i = 0, l = keys.length; i < l; ++i) {
				delete ret[keys[i]];
			}
			return ret;
		}
	});
	
	$.fn.extend({
		/** formの値をまとめて取得/設定 (実際にはformでなくても実行可能)
		 * 
		 * @param {string|string[]|object} [arg0 = すべての値を取得]  nameもしくは値
		 *   string, string[] : 指定したnameの値を取得
		 *   object : 値を設定
		 * 
		 * @returns {string|object}
		 *   arg0 == string : string  nameに対応する値
		 *   arg0 == string[] or 省略時 : object  name-values
		 *   rag0 == object : this
		 */
		formValues: function(arg0) {
			var root = this.eq(0);
			if (arguments.length === 0 || Object(arg0) instanceof String || arg0 instanceof Array) {
				// 取得
				var values = {};
				if (arguments.length === 0) {
					root.find('[name]').each(function() {
						values[this.name] = this.value;
					});
				} else if (arg0 instanceof Array) {
					var names = arg0;
					names.forEach(function(name) {
						values[name] = root.find('[name="' + name + '"]').val();
					});
				} else {
					return root.find('[name="' + arg0 + '"]').val();
				}
				return values;
			}
			else {
				// 設定
				var values = arg0;
				for (var name in values) {
					root.find('[name="' + name + '"]').val(values[name]);
				}
				return this;  // 1番目の要素ではなく、読み出し前の要素を返すことに注意
			}
		}, 
		/* テキストエリアの高さを自動調整 & 調整用にイベント処理を追加
		 */
		adjustHeight: function(options) {
			function adjust_height(ta) {
				var lines = ta.value.split(/\r\n?|\n/).length;
				ta.rows = lines;
			}
			function on_keydown(evt) {
				if (evt.originalEvent.keyIdentifier === 'Enter') {
					// onkeydownイベント発生時にはtextarea#valueが更新されていないので、
					// 予めEnterの分を+1する
					// (onkeydown後、onkeyup前にtextarea#valueが更新される？)
					var lines = this.value.split(/\r\n?|\n/).length + 1;
					this.rows = lines;
				}
			}
			function on_keyup(evt) {
				// onkeyupでEnterを処理すると一瞬スクロールバーが見えるので、Enterはonkeydownで処理する
				if (evt.originalEvent.keyIdentifier !== 'Enter') {
					adjust_height(this);
				}
			}
			
			return this.each(function() {
				if (this.tagName.toLowerCase() === 'textarea') {
					adjust_height(this);
					$(this)
						.keydown(on_keydown)
						.keyup(on_keyup);
				}
			});
		}, 
		/* 要素内の空白テキストを除去
		 */
		removeSpaces: function(options) {
			var re_wsp = new RegExp();
			re_wsp.compile('^\\s*$');
			
			return this.each(function() {
				var xpathRes = document.evaluate('text()', this, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
				for (var i = 0, l = xpathRes.snapshotLength; i < l; ++i) {
					var text = xpathRes.snapshotItem(i);
					if (re_wsp.test(text.nodeValue)) {
						text.parentNode.removeChild(text);
					}
				}
			});
		}, 
		/* 各要素の幅を合計した値を算出
		 */
		totalWidth: function(options) {
			var total = 0;
			this.each(function() {
				total += $(this).outerWidth(true);
			});
			return total;
		}, 
		/* 要素の幅を可能な限り広げる
		 * box-sizing: border-boxが指定されていること
		 */
		fullyExtendWidth: function(options) {
			// サイズ調整前の要素の幅がウィンドウ幅を超えている & 親要素の幅が固定されていない場合、
			// 親要素のサイズ = サイズ調整前の要素の幅となってしまい、調整後の要素がウィンドウをはみ出る
			// そのため、あらかじめ調整する要素の幅をwidth(0)で0にしておく。
			return this.width(0).each(function() {
				var max_width = $(this).parent().width();
				var min_width = $(this).siblings().totalWidth();
				var new_width = max_width - min_width;
				$(this).width(new_width);
			});
		}
	});
})(jQuery);
