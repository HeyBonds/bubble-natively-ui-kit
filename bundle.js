(() => {
  // node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var t;
  var i;
  var o;
  var r;
  var e;
  var f;
  var c;
  var s;
  var a;
  var h;
  var p = {};
  var v = [];
  var y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  var d = Array.isArray;
  function w(n2, l3) {
    for (var u3 in l3) n2[u3] = l3[u3];
    return n2;
  }
  function g(n2) {
    n2 && n2.parentNode && n2.parentNode.removeChild(n2);
  }
  function _(l3, u3, t3) {
    var i3, o3, r3, e3 = {};
    for (r3 in u3) "key" == r3 ? i3 = u3[r3] : "ref" == r3 ? o3 = u3[r3] : e3[r3] = u3[r3];
    if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps) for (r3 in l3.defaultProps) void 0 === e3[r3] && (e3[r3] = l3.defaultProps[r3]);
    return m(l3, e3, i3, o3, null);
  }
  function m(n2, t3, i3, o3, r3) {
    var e3 = { type: n2, props: t3, key: i3, ref: o3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == r3 ? ++u : r3, __i: -1, __u: 0 };
    return null == r3 && null != l.vnode && l.vnode(e3), e3;
  }
  function b() {
    return { current: null };
  }
  function k(n2) {
    return n2.children;
  }
  function x(n2, l3) {
    this.props = n2, this.context = l3;
  }
  function S(n2, l3) {
    if (null == l3) return n2.__ ? S(n2.__, n2.__i + 1) : null;
    for (var u3; l3 < n2.__k.length; l3++) if (null != (u3 = n2.__k[l3]) && null != u3.__e) return u3.__e;
    return "function" == typeof n2.type ? S(n2) : null;
  }
  function C(n2) {
    var l3, u3;
    if (null != (n2 = n2.__) && null != n2.__c) {
      for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++) if (null != (u3 = n2.__k[l3]) && null != u3.__e) {
        n2.__e = n2.__c.base = u3.__e;
        break;
      }
      return C(n2);
    }
  }
  function M(n2) {
    (!n2.__d && (n2.__d = true) && i.push(n2) && !$.__r++ || o != l.debounceRendering) && ((o = l.debounceRendering) || r)($);
  }
  function $() {
    for (var n2, u3, t3, o3, r3, f3, c3, s3 = 1; i.length; ) i.length > s3 && i.sort(e), n2 = i.shift(), s3 = i.length, n2.__d && (t3 = void 0, o3 = void 0, r3 = (o3 = (u3 = n2).__v).__e, f3 = [], c3 = [], u3.__P && ((t3 = w({}, o3)).__v = o3.__v + 1, l.vnode && l.vnode(t3), O(u3.__P, t3, o3, u3.__n, u3.__P.namespaceURI, 32 & o3.__u ? [r3] : null, f3, null == r3 ? S(o3) : r3, !!(32 & o3.__u), c3), t3.__v = o3.__v, t3.__.__k[t3.__i] = t3, N(f3, t3, c3), o3.__e = o3.__ = null, t3.__e != r3 && C(t3)));
    $.__r = 0;
  }
  function I(n2, l3, u3, t3, i3, o3, r3, e3, f3, c3, s3) {
    var a3, h3, y3, d3, w4, g4, _3, m3 = t3 && t3.__k || v, b2 = l3.length;
    for (f3 = P(u3, l3, m3, f3, b2), a3 = 0; a3 < b2; a3++) null != (y3 = u3.__k[a3]) && (h3 = -1 == y3.__i ? p : m3[y3.__i] || p, y3.__i = a3, g4 = O(n2, y3, h3, i3, o3, r3, e3, f3, c3, s3), d3 = y3.__e, y3.ref && h3.ref != y3.ref && (h3.ref && B(h3.ref, null, y3), s3.push(y3.ref, y3.__c || d3, y3)), null == w4 && null != d3 && (w4 = d3), (_3 = !!(4 & y3.__u)) || h3.__k === y3.__k ? f3 = A(y3, f3, n2, _3) : "function" == typeof y3.type && void 0 !== g4 ? f3 = g4 : d3 && (f3 = d3.nextSibling), y3.__u &= -7);
    return u3.__e = w4, f3;
  }
  function P(n2, l3, u3, t3, i3) {
    var o3, r3, e3, f3, c3, s3 = u3.length, a3 = s3, h3 = 0;
    for (n2.__k = new Array(i3), o3 = 0; o3 < i3; o3++) null != (r3 = l3[o3]) && "boolean" != typeof r3 && "function" != typeof r3 ? ("string" == typeof r3 || "number" == typeof r3 || "bigint" == typeof r3 || r3.constructor == String ? r3 = n2.__k[o3] = m(null, r3, null, null, null) : d(r3) ? r3 = n2.__k[o3] = m(k, { children: r3 }, null, null, null) : void 0 === r3.constructor && r3.__b > 0 ? r3 = n2.__k[o3] = m(r3.type, r3.props, r3.key, r3.ref ? r3.ref : null, r3.__v) : n2.__k[o3] = r3, f3 = o3 + h3, r3.__ = n2, r3.__b = n2.__b + 1, e3 = null, -1 != (c3 = r3.__i = L(r3, u3, f3, a3)) && (a3--, (e3 = u3[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i3 > s3 ? h3-- : i3 < s3 && h3++), "function" != typeof r3.type && (r3.__u |= 4)) : c3 != f3 && (c3 == f3 - 1 ? h3-- : c3 == f3 + 1 ? h3++ : (c3 > f3 ? h3-- : h3++, r3.__u |= 4))) : n2.__k[o3] = null;
    if (a3) for (o3 = 0; o3 < s3; o3++) null != (e3 = u3[o3]) && 0 == (2 & e3.__u) && (e3.__e == t3 && (t3 = S(e3)), D(e3, e3));
    return t3;
  }
  function A(n2, l3, u3, t3) {
    var i3, o3;
    if ("function" == typeof n2.type) {
      for (i3 = n2.__k, o3 = 0; i3 && o3 < i3.length; o3++) i3[o3] && (i3[o3].__ = n2, l3 = A(i3[o3], l3, u3, t3));
      return l3;
    }
    n2.__e != l3 && (t3 && (l3 && n2.type && !l3.parentNode && (l3 = S(n2)), u3.insertBefore(n2.__e, l3 || null)), l3 = n2.__e);
    do {
      l3 = l3 && l3.nextSibling;
    } while (null != l3 && 8 == l3.nodeType);
    return l3;
  }
  function H(n2, l3) {
    return l3 = l3 || [], null == n2 || "boolean" == typeof n2 || (d(n2) ? n2.some(function(n3) {
      H(n3, l3);
    }) : l3.push(n2)), l3;
  }
  function L(n2, l3, u3, t3) {
    var i3, o3, r3, e3 = n2.key, f3 = n2.type, c3 = l3[u3], s3 = null != c3 && 0 == (2 & c3.__u);
    if (null === c3 && null == e3 || s3 && e3 == c3.key && f3 == c3.type) return u3;
    if (t3 > (s3 ? 1 : 0)) {
      for (i3 = u3 - 1, o3 = u3 + 1; i3 >= 0 || o3 < l3.length; ) if (null != (c3 = l3[r3 = i3 >= 0 ? i3-- : o3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f3 == c3.type) return r3;
    }
    return -1;
  }
  function T(n2, l3, u3) {
    "-" == l3[0] ? n2.setProperty(l3, null == u3 ? "" : u3) : n2[l3] = null == u3 ? "" : "number" != typeof u3 || y.test(l3) ? u3 : u3 + "px";
  }
  function j(n2, l3, u3, t3, i3) {
    var o3, r3;
    n: if ("style" == l3) if ("string" == typeof u3) n2.style.cssText = u3;
    else {
      if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3) for (l3 in t3) u3 && l3 in u3 || T(n2.style, l3, "");
      if (u3) for (l3 in u3) t3 && u3[l3] == t3[l3] || T(n2.style, l3, u3[l3]);
    }
    else if ("o" == l3[0] && "n" == l3[1]) o3 = l3 != (l3 = l3.replace(f, "$1")), r3 = l3.toLowerCase(), l3 = r3 in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? r3.slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + o3] = u3, u3 ? t3 ? u3.u = t3.u : (u3.u = c, n2.addEventListener(l3, o3 ? a : s, o3)) : n2.removeEventListener(l3, o3 ? a : s, o3);
    else {
      if ("http://www.w3.org/2000/svg" == i3) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {
        n2[l3] = null == u3 ? "" : u3;
        break n;
      } catch (n3) {
      }
      "function" == typeof u3 || (null == u3 || false === u3 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u3 ? "" : u3));
    }
  }
  function F(n2) {
    return function(u3) {
      if (this.l) {
        var t3 = this.l[u3.type + n2];
        if (null == u3.t) u3.t = c++;
        else if (u3.t < t3.u) return;
        return t3(l.event ? l.event(u3) : u3);
      }
    };
  }
  function O(n2, u3, t3, i3, o3, r3, e3, f3, c3, s3) {
    var a3, h3, p3, v3, y3, _3, m3, b2, S2, C4, M3, $3, P4, A4, H3, L3, T4, j4 = u3.type;
    if (void 0 !== u3.constructor) return null;
    128 & t3.__u && (c3 = !!(32 & t3.__u), r3 = [f3 = u3.__e = t3.__e]), (a3 = l.__b) && a3(u3);
    n: if ("function" == typeof j4) try {
      if (b2 = u3.props, S2 = "prototype" in j4 && j4.prototype.render, C4 = (a3 = j4.contextType) && i3[a3.__c], M3 = a3 ? C4 ? C4.props.value : a3.__ : i3, t3.__c ? m3 = (h3 = u3.__c = t3.__c).__ = h3.__E : (S2 ? u3.__c = h3 = new j4(b2, M3) : (u3.__c = h3 = new x(b2, M3), h3.constructor = j4, h3.render = E), C4 && C4.sub(h3), h3.state || (h3.state = {}), h3.__n = i3, p3 = h3.__d = true, h3.__h = [], h3._sb = []), S2 && null == h3.__s && (h3.__s = h3.state), S2 && null != j4.getDerivedStateFromProps && (h3.__s == h3.state && (h3.__s = w({}, h3.__s)), w(h3.__s, j4.getDerivedStateFromProps(b2, h3.__s))), v3 = h3.props, y3 = h3.state, h3.__v = u3, p3) S2 && null == j4.getDerivedStateFromProps && null != h3.componentWillMount && h3.componentWillMount(), S2 && null != h3.componentDidMount && h3.__h.push(h3.componentDidMount);
      else {
        if (S2 && null == j4.getDerivedStateFromProps && b2 !== v3 && null != h3.componentWillReceiveProps && h3.componentWillReceiveProps(b2, M3), u3.__v == t3.__v || !h3.__e && null != h3.shouldComponentUpdate && false === h3.shouldComponentUpdate(b2, h3.__s, M3)) {
          for (u3.__v != t3.__v && (h3.props = b2, h3.state = h3.__s, h3.__d = false), u3.__e = t3.__e, u3.__k = t3.__k, u3.__k.some(function(n3) {
            n3 && (n3.__ = u3);
          }), $3 = 0; $3 < h3._sb.length; $3++) h3.__h.push(h3._sb[$3]);
          h3._sb = [], h3.__h.length && e3.push(h3);
          break n;
        }
        null != h3.componentWillUpdate && h3.componentWillUpdate(b2, h3.__s, M3), S2 && null != h3.componentDidUpdate && h3.__h.push(function() {
          h3.componentDidUpdate(v3, y3, _3);
        });
      }
      if (h3.context = M3, h3.props = b2, h3.__P = n2, h3.__e = false, P4 = l.__r, A4 = 0, S2) {
        for (h3.state = h3.__s, h3.__d = false, P4 && P4(u3), a3 = h3.render(h3.props, h3.state, h3.context), H3 = 0; H3 < h3._sb.length; H3++) h3.__h.push(h3._sb[H3]);
        h3._sb = [];
      } else do {
        h3.__d = false, P4 && P4(u3), a3 = h3.render(h3.props, h3.state, h3.context), h3.state = h3.__s;
      } while (h3.__d && ++A4 < 25);
      h3.state = h3.__s, null != h3.getChildContext && (i3 = w(w({}, i3), h3.getChildContext())), S2 && !p3 && null != h3.getSnapshotBeforeUpdate && (_3 = h3.getSnapshotBeforeUpdate(v3, y3)), L3 = a3, null != a3 && a3.type === k && null == a3.key && (L3 = V(a3.props.children)), f3 = I(n2, d(L3) ? L3 : [L3], u3, t3, i3, o3, r3, e3, f3, c3, s3), h3.base = u3.__e, u3.__u &= -161, h3.__h.length && e3.push(h3), m3 && (h3.__E = h3.__ = null);
    } catch (n3) {
      if (u3.__v = null, c3 || null != r3) if (n3.then) {
        for (u3.__u |= c3 ? 160 : 128; f3 && 8 == f3.nodeType && f3.nextSibling; ) f3 = f3.nextSibling;
        r3[r3.indexOf(f3)] = null, u3.__e = f3;
      } else {
        for (T4 = r3.length; T4--; ) g(r3[T4]);
        z(u3);
      }
      else u3.__e = t3.__e, u3.__k = t3.__k, n3.then || z(u3);
      l.__e(n3, u3, t3);
    }
    else null == r3 && u3.__v == t3.__v ? (u3.__k = t3.__k, u3.__e = t3.__e) : f3 = u3.__e = q(t3.__e, u3, t3, i3, o3, r3, e3, c3, s3);
    return (a3 = l.diffed) && a3(u3), 128 & u3.__u ? void 0 : f3;
  }
  function z(n2) {
    n2 && n2.__c && (n2.__c.__e = true), n2 && n2.__k && n2.__k.forEach(z);
  }
  function N(n2, u3, t3) {
    for (var i3 = 0; i3 < t3.length; i3++) B(t3[i3], t3[++i3], t3[++i3]);
    l.__c && l.__c(u3, n2), n2.some(function(u4) {
      try {
        n2 = u4.__h, u4.__h = [], n2.some(function(n3) {
          n3.call(u4);
        });
      } catch (n3) {
        l.__e(n3, u4.__v);
      }
    });
  }
  function V(n2) {
    return "object" != typeof n2 || null == n2 || n2.__b && n2.__b > 0 ? n2 : d(n2) ? n2.map(V) : w({}, n2);
  }
  function q(u3, t3, i3, o3, r3, e3, f3, c3, s3) {
    var a3, h3, v3, y3, w4, _3, m3, b2 = i3.props || p, k4 = t3.props, x4 = t3.type;
    if ("svg" == x4 ? r3 = "http://www.w3.org/2000/svg" : "math" == x4 ? r3 = "http://www.w3.org/1998/Math/MathML" : r3 || (r3 = "http://www.w3.org/1999/xhtml"), null != e3) {
      for (a3 = 0; a3 < e3.length; a3++) if ((w4 = e3[a3]) && "setAttribute" in w4 == !!x4 && (x4 ? w4.localName == x4 : 3 == w4.nodeType)) {
        u3 = w4, e3[a3] = null;
        break;
      }
    }
    if (null == u3) {
      if (null == x4) return document.createTextNode(k4);
      u3 = document.createElementNS(r3, x4, k4.is && k4), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;
    }
    if (null == x4) b2 === k4 || c3 && u3.data == k4 || (u3.data = k4);
    else {
      if (e3 = e3 && n.call(u3.childNodes), !c3 && null != e3) for (b2 = {}, a3 = 0; a3 < u3.attributes.length; a3++) b2[(w4 = u3.attributes[a3]).name] = w4.value;
      for (a3 in b2) if (w4 = b2[a3], "children" == a3) ;
      else if ("dangerouslySetInnerHTML" == a3) v3 = w4;
      else if (!(a3 in k4)) {
        if ("value" == a3 && "defaultValue" in k4 || "checked" == a3 && "defaultChecked" in k4) continue;
        j(u3, a3, null, w4, r3);
      }
      for (a3 in k4) w4 = k4[a3], "children" == a3 ? y3 = w4 : "dangerouslySetInnerHTML" == a3 ? h3 = w4 : "value" == a3 ? _3 = w4 : "checked" == a3 ? m3 = w4 : c3 && "function" != typeof w4 || b2[a3] === w4 || j(u3, a3, w4, b2[a3], r3);
      if (h3) c3 || v3 && (h3.__html == v3.__html || h3.__html == u3.innerHTML) || (u3.innerHTML = h3.__html), t3.__k = [];
      else if (v3 && (u3.innerHTML = ""), I("template" == t3.type ? u3.content : u3, d(y3) ? y3 : [y3], t3, i3, o3, "foreignObject" == x4 ? "http://www.w3.org/1999/xhtml" : r3, e3, f3, e3 ? e3[0] : i3.__k && S(i3, 0), c3, s3), null != e3) for (a3 = e3.length; a3--; ) g(e3[a3]);
      c3 || (a3 = "value", "progress" == x4 && null == _3 ? u3.removeAttribute("value") : null != _3 && (_3 !== u3[a3] || "progress" == x4 && !_3 || "option" == x4 && _3 != b2[a3]) && j(u3, a3, _3, b2[a3], r3), a3 = "checked", null != m3 && m3 != u3[a3] && j(u3, a3, m3, b2[a3], r3));
    }
    return u3;
  }
  function B(n2, u3, t3) {
    try {
      if ("function" == typeof n2) {
        var i3 = "function" == typeof n2.__u;
        i3 && n2.__u(), i3 && null == u3 || (n2.__u = n2(u3));
      } else n2.current = u3;
    } catch (n3) {
      l.__e(n3, t3);
    }
  }
  function D(n2, u3, t3) {
    var i3, o3;
    if (l.unmount && l.unmount(n2), (i3 = n2.ref) && (i3.current && i3.current != n2.__e || B(i3, null, u3)), null != (i3 = n2.__c)) {
      if (i3.componentWillUnmount) try {
        i3.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u3);
      }
      i3.base = i3.__P = null;
    }
    if (i3 = n2.__k) for (o3 = 0; o3 < i3.length; o3++) i3[o3] && D(i3[o3], u3, t3 || "function" != typeof n2.type);
    t3 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
  }
  function E(n2, l3, u3) {
    return this.constructor(n2, u3);
  }
  function G(u3, t3, i3) {
    var o3, r3, e3, f3;
    t3 == document && (t3 = document.documentElement), l.__ && l.__(u3, t3), r3 = (o3 = "function" == typeof i3) ? null : i3 && i3.__k || t3.__k, e3 = [], f3 = [], O(t3, u3 = (!o3 && i3 || t3).__k = _(k, null, [u3]), r3 || p, p, t3.namespaceURI, !o3 && i3 ? [i3] : r3 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e3, !o3 && i3 ? i3 : r3 ? r3.__e : t3.firstChild, o3, f3), N(e3, u3, f3);
  }
  function J(n2, l3) {
    G(n2, l3, J);
  }
  function K(l3, u3, t3) {
    var i3, o3, r3, e3, f3 = w({}, l3.props);
    for (r3 in l3.type && l3.type.defaultProps && (e3 = l3.type.defaultProps), u3) "key" == r3 ? i3 = u3[r3] : "ref" == r3 ? o3 = u3[r3] : f3[r3] = void 0 === u3[r3] && null != e3 ? e3[r3] : u3[r3];
    return arguments.length > 2 && (f3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), m(l3.type, f3, i3 || l3.key, o3 || l3.ref, null);
  }
  function Q(n2) {
    function l3(n3) {
      var u3, t3;
      return this.getChildContext || (u3 = /* @__PURE__ */ new Set(), (t3 = {})[l3.__c] = this, this.getChildContext = function() {
        return t3;
      }, this.componentWillUnmount = function() {
        u3 = null;
      }, this.shouldComponentUpdate = function(n4) {
        this.props.value != n4.value && u3.forEach(function(n5) {
          n5.__e = true, M(n5);
        });
      }, this.sub = function(n4) {
        u3.add(n4);
        var l4 = n4.componentWillUnmount;
        n4.componentWillUnmount = function() {
          u3 && u3.delete(n4), l4 && l4.call(n4);
        };
      }), n3.children;
    }
    return l3.__c = "__cC" + h++, l3.__ = n2, l3.Provider = l3.__l = (l3.Consumer = function(n3, l4) {
      return n3.children(l4);
    }).contextType = l3, l3;
  }
  n = v.slice, l = { __e: function(n2, l3, u3, t3) {
    for (var i3, o3, r3; l3 = l3.__; ) if ((i3 = l3.__c) && !i3.__) try {
      if ((o3 = i3.constructor) && null != o3.getDerivedStateFromError && (i3.setState(o3.getDerivedStateFromError(n2)), r3 = i3.__d), null != i3.componentDidCatch && (i3.componentDidCatch(n2, t3 || {}), r3 = i3.__d), r3) return i3.__E = i3;
    } catch (l4) {
      n2 = l4;
    }
    throw n2;
  } }, u = 0, t = function(n2) {
    return null != n2 && void 0 === n2.constructor;
  }, x.prototype.setState = function(n2, l3) {
    var u3;
    u3 = null != this.__s && this.__s != this.state ? this.__s : this.__s = w({}, this.state), "function" == typeof n2 && (n2 = n2(w({}, u3), this.props)), n2 && w(u3, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), M(this));
  }, x.prototype.forceUpdate = function(n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
  }, x.prototype.render = k, i = [], r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {
    return n2.__v.__b - l3.__v.__b;
  }, $.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = F(false), a = F(true), h = 0;

  // node_modules/preact/hooks/dist/hooks.module.js
  var t2;
  var r2;
  var u2;
  var i2;
  var o2 = 0;
  var f2 = [];
  var c2 = l;
  var e2 = c2.__b;
  var a2 = c2.__r;
  var v2 = c2.diffed;
  var l2 = c2.__c;
  var m2 = c2.unmount;
  var s2 = c2.__;
  function p2(n2, t3) {
    c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;
    var u3 = r2.__H || (r2.__H = { __: [], __h: [] });
    return n2 >= u3.__.length && u3.__.push({}), u3.__[n2];
  }
  function d2(n2) {
    return o2 = 1, h2(D2, n2);
  }
  function h2(n2, u3, i3) {
    var o3 = p2(t2++, 2);
    if (o3.t = n2, !o3.__c && (o3.__ = [i3 ? i3(u3) : D2(void 0, u3), function(n3) {
      var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
      t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
    }], o3.__c = r2, !r2.__f)) {
      var f3 = function(n3, t3, r3) {
        if (!o3.__c.__H) return true;
        var u4 = o3.__c.__H.__.filter(function(n4) {
          return !!n4.__c;
        });
        if (u4.every(function(n4) {
          return !n4.__N;
        })) return !c3 || c3.call(this, n3, t3, r3);
        var i4 = o3.__c.props !== n3;
        return u4.forEach(function(n4) {
          if (n4.__N) {
            var t4 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i4 = true);
          }
        }), c3 && c3.call(this, n3, t3, r3) || i4;
      };
      r2.__f = true;
      var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
      r2.componentWillUpdate = function(n3, t3, r3) {
        if (this.__e) {
          var u4 = c3;
          c3 = void 0, f3(n3, t3, r3), c3 = u4;
        }
        e3 && e3.call(this, n3, t3, r3);
      }, r2.shouldComponentUpdate = f3;
    }
    return o3.__N || o3.__;
  }
  function y2(n2, u3) {
    var i3 = p2(t2++, 3);
    !c2.__s && C2(i3.__H, u3) && (i3.__ = n2, i3.u = u3, r2.__H.__h.push(i3));
  }
  function _2(n2, u3) {
    var i3 = p2(t2++, 4);
    !c2.__s && C2(i3.__H, u3) && (i3.__ = n2, i3.u = u3, r2.__h.push(i3));
  }
  function A2(n2) {
    return o2 = 5, T2(function() {
      return { current: n2 };
    }, []);
  }
  function F2(n2, t3, r3) {
    o2 = 6, _2(function() {
      if ("function" == typeof n2) {
        var r4 = n2(t3());
        return function() {
          n2(null), r4 && "function" == typeof r4 && r4();
        };
      }
      if (n2) return n2.current = t3(), function() {
        return n2.current = null;
      };
    }, null == r3 ? r3 : r3.concat(n2));
  }
  function T2(n2, r3) {
    var u3 = p2(t2++, 7);
    return C2(u3.__H, r3) && (u3.__ = n2(), u3.__H = r3, u3.__h = n2), u3.__;
  }
  function q2(n2, t3) {
    return o2 = 8, T2(function() {
      return n2;
    }, t3);
  }
  function x2(n2) {
    var u3 = r2.context[n2.__c], i3 = p2(t2++, 9);
    return i3.c = n2, u3 ? (null == i3.__ && (i3.__ = true, u3.sub(r2)), u3.props.value) : n2.__;
  }
  function P2(n2, t3) {
    c2.useDebugValue && c2.useDebugValue(t3 ? t3(n2) : n2);
  }
  function g2() {
    var n2 = p2(t2++, 11);
    if (!n2.__) {
      for (var u3 = r2.__v; null !== u3 && !u3.__m && null !== u3.__; ) u3 = u3.__;
      var i3 = u3.__m || (u3.__m = [0, 0]);
      n2.__ = "P" + i3[0] + "-" + i3[1]++;
    }
    return n2.__;
  }
  function j2() {
    for (var n2; n2 = f2.shift(); ) if (n2.__P && n2.__H) try {
      n2.__H.__h.forEach(z2), n2.__H.__h.forEach(B2), n2.__H.__h = [];
    } catch (t3) {
      n2.__H.__h = [], c2.__e(t3, n2.__v);
    }
  }
  c2.__b = function(n2) {
    r2 = null, e2 && e2(n2);
  }, c2.__ = function(n2, t3) {
    n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), s2 && s2(n2, t3);
  }, c2.__r = function(n2) {
    a2 && a2(n2), t2 = 0;
    var i3 = (r2 = n2.__c).__H;
    i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
      n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
    })) : (i3.__h.forEach(z2), i3.__h.forEach(B2), i3.__h = [], t2 = 0)), u2 = r2;
  }, c2.diffed = function(n2) {
    v2 && v2(n2);
    var t3 = n2.__c;
    t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.forEach(function(n3) {
      n3.u && (n3.__H = n3.u), n3.u = void 0;
    })), u2 = r2 = null;
  }, c2.__c = function(n2, t3) {
    t3.some(function(n3) {
      try {
        n3.__h.forEach(z2), n3.__h = n3.__h.filter(function(n4) {
          return !n4.__ || B2(n4);
        });
      } catch (r3) {
        t3.some(function(n4) {
          n4.__h && (n4.__h = []);
        }), t3 = [], c2.__e(r3, n3.__v);
      }
    }), l2 && l2(n2, t3);
  }, c2.unmount = function(n2) {
    m2 && m2(n2);
    var t3, r3 = n2.__c;
    r3 && r3.__H && (r3.__H.__.forEach(function(n3) {
      try {
        z2(n3);
      } catch (n4) {
        t3 = n4;
      }
    }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));
  };
  var k2 = "function" == typeof requestAnimationFrame;
  function w2(n2) {
    var t3, r3 = function() {
      clearTimeout(u3), k2 && cancelAnimationFrame(t3), setTimeout(n2);
    }, u3 = setTimeout(r3, 35);
    k2 && (t3 = requestAnimationFrame(r3));
  }
  function z2(n2) {
    var t3 = r2, u3 = n2.__c;
    "function" == typeof u3 && (n2.__c = void 0, u3()), r2 = t3;
  }
  function B2(n2) {
    var t3 = r2;
    n2.__c = n2.__(), r2 = t3;
  }
  function C2(n2, t3) {
    return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
      return t4 !== n2[r3];
    });
  }
  function D2(n2, t3) {
    return "function" == typeof t3 ? t3(n2) : t3;
  }

  // node_modules/preact/compat/dist/compat.module.js
  function g3(n2, t3) {
    for (var e3 in t3) n2[e3] = t3[e3];
    return n2;
  }
  function E2(n2, t3) {
    for (var e3 in n2) if ("__source" !== e3 && !(e3 in t3)) return true;
    for (var r3 in t3) if ("__source" !== r3 && n2[r3] !== t3[r3]) return true;
    return false;
  }
  function C3(n2, t3) {
    var e3 = t3(), r3 = d2({ t: { __: e3, u: t3 } }), u3 = r3[0].t, o3 = r3[1];
    return _2(function() {
      u3.__ = e3, u3.u = t3, R(u3) && o3({ t: u3 });
    }, [n2, e3, t3]), y2(function() {
      return R(u3) && o3({ t: u3 }), n2(function() {
        R(u3) && o3({ t: u3 });
      });
    }, [n2]), e3;
  }
  function R(n2) {
    var t3, e3, r3 = n2.u, u3 = n2.__;
    try {
      var o3 = r3();
      return !((t3 = u3) === (e3 = o3) && (0 !== t3 || 1 / t3 == 1 / e3) || t3 != t3 && e3 != e3);
    } catch (n3) {
      return true;
    }
  }
  function x3(n2) {
    n2();
  }
  function w3(n2) {
    return n2;
  }
  function k3() {
    return [false, x3];
  }
  var I2 = _2;
  function N2(n2, t3) {
    this.props = n2, this.context = t3;
  }
  function M2(n2, e3) {
    function r3(n3) {
      var t3 = this.props.ref, r4 = t3 == n3.ref;
      return !r4 && t3 && (t3.call ? t3(null) : t3.current = null), e3 ? !e3(this.props, n3) || !r4 : E2(this.props, n3);
    }
    function u3(e4) {
      return this.shouldComponentUpdate = r3, _(n2, e4);
    }
    return u3.displayName = "Memo(" + (n2.displayName || n2.name) + ")", u3.prototype.isReactComponent = true, u3.__f = true, u3.type = n2, u3;
  }
  (N2.prototype = new x()).isPureReactComponent = true, N2.prototype.shouldComponentUpdate = function(n2, t3) {
    return E2(this.props, n2) || E2(this.state, t3);
  };
  var T3 = l.__b;
  l.__b = function(n2) {
    n2.type && n2.type.__f && n2.ref && (n2.props.ref = n2.ref, n2.ref = null), T3 && T3(n2);
  };
  var A3 = "undefined" != typeof Symbol && Symbol.for && /* @__PURE__ */ Symbol.for("react.forward_ref") || 3911;
  function D3(n2) {
    function t3(t4) {
      var e3 = g3({}, t4);
      return delete e3.ref, n2(e3, t4.ref || null);
    }
    return t3.$$typeof = A3, t3.render = n2, t3.prototype.isReactComponent = t3.__f = true, t3.displayName = "ForwardRef(" + (n2.displayName || n2.name) + ")", t3;
  }
  var L2 = function(n2, t3) {
    return null == n2 ? null : H(H(n2).map(t3));
  };
  var O2 = { map: L2, forEach: L2, count: function(n2) {
    return n2 ? H(n2).length : 0;
  }, only: function(n2) {
    var t3 = H(n2);
    if (1 !== t3.length) throw "Children.only";
    return t3[0];
  }, toArray: H };
  var U = l.__e;
  l.__e = function(n2, t3, e3, r3) {
    if (n2.then) {
      for (var u3, o3 = t3; o3 = o3.__; ) if ((u3 = o3.__c) && u3.__c) return null == t3.__e && (t3.__e = e3.__e, t3.__k = e3.__k), u3.__c(n2, t3);
    }
    U(n2, t3, e3, r3);
  };
  var F3 = l.unmount;
  function V2(n2, t3, e3) {
    return n2 && (n2.__c && n2.__c.__H && (n2.__c.__H.__.forEach(function(n3) {
      "function" == typeof n3.__c && n3.__c();
    }), n2.__c.__H = null), null != (n2 = g3({}, n2)).__c && (n2.__c.__P === e3 && (n2.__c.__P = t3), n2.__c.__e = true, n2.__c = null), n2.__k = n2.__k && n2.__k.map(function(n3) {
      return V2(n3, t3, e3);
    })), n2;
  }
  function W(n2, t3, e3) {
    return n2 && e3 && (n2.__v = null, n2.__k = n2.__k && n2.__k.map(function(n3) {
      return W(n3, t3, e3);
    }), n2.__c && n2.__c.__P === t3 && (n2.__e && e3.appendChild(n2.__e), n2.__c.__e = true, n2.__c.__P = e3)), n2;
  }
  function P3() {
    this.__u = 0, this.o = null, this.__b = null;
  }
  function j3(n2) {
    if (!n2.__) return null;
    var t3 = n2.__.__c;
    return t3 && t3.__a && t3.__a(n2);
  }
  function z3(n2) {
    var e3, r3, u3, o3 = null;
    function i3(i4) {
      if (e3 || (e3 = n2()).then(function(n3) {
        n3 && (o3 = n3.default || n3), u3 = true;
      }, function(n3) {
        r3 = n3, u3 = true;
      }), r3) throw r3;
      if (!u3) throw e3;
      return o3 ? _(o3, i4) : null;
    }
    return i3.displayName = "Lazy", i3.__f = true, i3;
  }
  function B3() {
    this.i = null, this.l = null;
  }
  l.unmount = function(n2) {
    var t3 = n2.__c;
    t3 && (t3.__z = true), t3 && t3.__R && t3.__R(), t3 && 32 & n2.__u && (n2.type = null), F3 && F3(n2);
  }, (P3.prototype = new x()).__c = function(n2, t3) {
    var e3 = t3.__c, r3 = this;
    null == r3.o && (r3.o = []), r3.o.push(e3);
    var u3 = j3(r3.__v), o3 = false, i3 = function() {
      o3 || r3.__z || (o3 = true, e3.__R = null, u3 ? u3(c3) : c3());
    };
    e3.__R = i3;
    var l3 = e3.__P;
    e3.__P = null;
    var c3 = function() {
      if (!--r3.__u) {
        if (r3.state.__a) {
          var n3 = r3.state.__a;
          r3.__v.__k[0] = W(n3, n3.__c.__P, n3.__c.__O);
        }
        var t4;
        for (r3.setState({ __a: r3.__b = null }); t4 = r3.o.pop(); ) t4.__P = l3, t4.forceUpdate();
      }
    };
    r3.__u++ || 32 & t3.__u || r3.setState({ __a: r3.__b = r3.__v.__k[0] }), n2.then(i3, i3);
  }, P3.prototype.componentWillUnmount = function() {
    this.o = [];
  }, P3.prototype.render = function(n2, e3) {
    if (this.__b) {
      if (this.__v.__k) {
        var r3 = document.createElement("div"), o3 = this.__v.__k[0].__c;
        this.__v.__k[0] = V2(this.__b, r3, o3.__O = o3.__P);
      }
      this.__b = null;
    }
    var i3 = e3.__a && _(k, null, n2.fallback);
    return i3 && (i3.__u &= -33), [_(k, null, e3.__a ? null : n2.children), i3];
  };
  var H2 = function(n2, t3, e3) {
    if (++e3[1] === e3[0] && n2.l.delete(t3), n2.props.revealOrder && ("t" !== n2.props.revealOrder[0] || !n2.l.size)) for (e3 = n2.i; e3; ) {
      for (; e3.length > 3; ) e3.pop()();
      if (e3[1] < e3[0]) break;
      n2.i = e3 = e3[2];
    }
  };
  function Z(n2) {
    return this.getChildContext = function() {
      return n2.context;
    }, n2.children;
  }
  function Y(n2) {
    var e3 = this, r3 = n2.h;
    if (e3.componentWillUnmount = function() {
      G(null, e3.v), e3.v = null, e3.h = null;
    }, e3.h && e3.h !== r3 && e3.componentWillUnmount(), !e3.v) {
      for (var u3 = e3.__v; null !== u3 && !u3.__m && null !== u3.__; ) u3 = u3.__;
      e3.h = r3, e3.v = { nodeType: 1, parentNode: r3, childNodes: [], __k: { __m: u3.__m }, contains: function() {
        return true;
      }, namespaceURI: r3.namespaceURI, insertBefore: function(n3, t3) {
        this.childNodes.push(n3), e3.h.insertBefore(n3, t3);
      }, removeChild: function(n3) {
        this.childNodes.splice(this.childNodes.indexOf(n3) >>> 1, 1), e3.h.removeChild(n3);
      } };
    }
    G(_(Z, { context: e3.context }, n2.__v), e3.v);
  }
  function $2(n2, e3) {
    var r3 = _(Y, { __v: n2, h: e3 });
    return r3.containerInfo = e3, r3;
  }
  (B3.prototype = new x()).__a = function(n2) {
    var t3 = this, e3 = j3(t3.__v), r3 = t3.l.get(n2);
    return r3[0]++, function(u3) {
      var o3 = function() {
        t3.props.revealOrder ? (r3.push(u3), H2(t3, n2, r3)) : u3();
      };
      e3 ? e3(o3) : o3();
    };
  }, B3.prototype.render = function(n2) {
    this.i = null, this.l = /* @__PURE__ */ new Map();
    var t3 = H(n2.children);
    n2.revealOrder && "b" === n2.revealOrder[0] && t3.reverse();
    for (var e3 = t3.length; e3--; ) this.l.set(t3[e3], this.i = [1, 0, this.i]);
    return n2.children;
  }, B3.prototype.componentDidUpdate = B3.prototype.componentDidMount = function() {
    var n2 = this;
    this.l.forEach(function(t3, e3) {
      H2(n2, e3, t3);
    });
  };
  var q3 = "undefined" != typeof Symbol && Symbol.for && /* @__PURE__ */ Symbol.for("react.element") || 60103;
  var G2 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
  var J2 = /^on(Ani|Tra|Tou|BeforeInp|Compo)/;
  var K2 = /[A-Z0-9]/g;
  var Q2 = "undefined" != typeof document;
  var X = function(n2) {
    return ("undefined" != typeof Symbol && "symbol" == typeof /* @__PURE__ */ Symbol() ? /fil|che|rad/ : /fil|che|ra/).test(n2);
  };
  function nn(n2, t3, e3) {
    return null == t3.__k && (t3.textContent = ""), G(n2, t3), "function" == typeof e3 && e3(), n2 ? n2.__c : null;
  }
  function tn(n2, t3, e3) {
    return J(n2, t3), "function" == typeof e3 && e3(), n2 ? n2.__c : null;
  }
  x.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t3) {
    Object.defineProperty(x.prototype, t3, { configurable: true, get: function() {
      return this["UNSAFE_" + t3];
    }, set: function(n2) {
      Object.defineProperty(this, t3, { configurable: true, writable: true, value: n2 });
    } });
  });
  var en = l.event;
  function rn() {
  }
  function un() {
    return this.cancelBubble;
  }
  function on() {
    return this.defaultPrevented;
  }
  l.event = function(n2) {
    return en && (n2 = en(n2)), n2.persist = rn, n2.isPropagationStopped = un, n2.isDefaultPrevented = on, n2.nativeEvent = n2;
  };
  var ln;
  var cn = { enumerable: false, configurable: true, get: function() {
    return this.class;
  } };
  var fn = l.vnode;
  l.vnode = function(n2) {
    "string" == typeof n2.type && (function(n3) {
      var t3 = n3.props, e3 = n3.type, u3 = {}, o3 = -1 === e3.indexOf("-");
      for (var i3 in t3) {
        var l3 = t3[i3];
        if (!("value" === i3 && "defaultValue" in t3 && null == l3 || Q2 && "children" === i3 && "noscript" === e3 || "class" === i3 || "className" === i3)) {
          var c3 = i3.toLowerCase();
          "defaultValue" === i3 && "value" in t3 && null == t3.value ? i3 = "value" : "download" === i3 && true === l3 ? l3 = "" : "translate" === c3 && "no" === l3 ? l3 = false : "o" === c3[0] && "n" === c3[1] ? "ondoubleclick" === c3 ? i3 = "ondblclick" : "onchange" !== c3 || "input" !== e3 && "textarea" !== e3 || X(t3.type) ? "onfocus" === c3 ? i3 = "onfocusin" : "onblur" === c3 ? i3 = "onfocusout" : J2.test(i3) && (i3 = c3) : c3 = i3 = "oninput" : o3 && G2.test(i3) ? i3 = i3.replace(K2, "-$&").toLowerCase() : null === l3 && (l3 = void 0), "oninput" === c3 && u3[i3 = c3] && (i3 = "oninputCapture"), u3[i3] = l3;
        }
      }
      "select" == e3 && u3.multiple && Array.isArray(u3.value) && (u3.value = H(t3.children).forEach(function(n4) {
        n4.props.selected = -1 != u3.value.indexOf(n4.props.value);
      })), "select" == e3 && null != u3.defaultValue && (u3.value = H(t3.children).forEach(function(n4) {
        n4.props.selected = u3.multiple ? -1 != u3.defaultValue.indexOf(n4.props.value) : u3.defaultValue == n4.props.value;
      })), t3.class && !t3.className ? (u3.class = t3.class, Object.defineProperty(u3, "className", cn)) : (t3.className && !t3.class || t3.class && t3.className) && (u3.class = u3.className = t3.className), n3.props = u3;
    })(n2), n2.$$typeof = q3, fn && fn(n2);
  };
  var an = l.__r;
  l.__r = function(n2) {
    an && an(n2), ln = n2.__c;
  };
  var sn = l.diffed;
  l.diffed = function(n2) {
    sn && sn(n2);
    var t3 = n2.props, e3 = n2.__e;
    null != e3 && "textarea" === n2.type && "value" in t3 && t3.value !== e3.value && (e3.value = null == t3.value ? "" : t3.value), ln = null;
  };
  var hn = { ReactCurrentDispatcher: { current: { readContext: function(n2) {
    return ln.__n[n2.__c].props.value;
  }, useCallback: q2, useContext: x2, useDebugValue: P2, useDeferredValue: w3, useEffect: y2, useId: g2, useImperativeHandle: F2, useInsertionEffect: I2, useLayoutEffect: _2, useMemo: T2, useReducer: h2, useRef: A2, useState: d2, useSyncExternalStore: C3, useTransition: k3 } } };
  function dn(n2) {
    return _.bind(null, n2);
  }
  function mn(n2) {
    return !!n2 && n2.$$typeof === q3;
  }
  function pn(n2) {
    return mn(n2) && n2.type === k;
  }
  function yn(n2) {
    return !!n2 && !!n2.displayName && ("string" == typeof n2.displayName || n2.displayName instanceof String) && n2.displayName.startsWith("Memo(");
  }
  function _n(n2) {
    return mn(n2) ? K.apply(null, arguments) : n2;
  }
  function bn(n2) {
    return !!n2.__k && (G(null, n2), true);
  }
  function Sn(n2) {
    return n2 && (n2.base || 1 === n2.nodeType && n2) || null;
  }
  var gn = function(n2, t3) {
    return n2(t3);
  };
  var En = function(n2, t3) {
    return n2(t3);
  };
  var Cn = k;
  var Rn = mn;
  var xn = { useState: d2, useId: g2, useReducer: h2, useEffect: y2, useLayoutEffect: _2, useInsertionEffect: I2, useTransition: k3, useDeferredValue: w3, useSyncExternalStore: C3, startTransition: x3, useRef: A2, useImperativeHandle: F2, useMemo: T2, useCallback: q2, useContext: x2, useDebugValue: P2, version: "18.3.1", Children: O2, render: nn, hydrate: tn, unmountComponentAtNode: bn, createPortal: $2, createElement: _, createContext: Q, createFactory: dn, cloneElement: _n, createRef: b, Fragment: k, isValidElement: mn, isElement: Rn, isFragment: pn, isMemo: yn, findDOMNode: Sn, Component: x, PureComponent: N2, memo: M2, forwardRef: D3, flushSync: En, unstable_batchedUpdates: gn, StrictMode: Cn, Suspense: P3, SuspenseList: B3, lazy: z3, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: hn };

  // node_modules/preact/compat/client.mjs
  function createRoot(container) {
    return {
      // eslint-disable-next-line
      render: function(children) {
        nn(children, container);
      },
      // eslint-disable-next-line
      unmount: function() {
        bn(container);
      }
    };
  }

  // src/components/HomeSection.jsx
  var HomeSection = ({ userName, userAvatar, credits, push }) => {
    const currentJourney = {
      title: "Intimacy",
      description: "Exploring how being wanted and desired intersects with sexual fulfilment together"
    };
    const sendToBubble = (action, data = {}) => {
      if (window.BubbleBridge) {
        window.BubbleBridge.send("bubble_fn_home", { action, ...data });
      }
    };
    return /* @__PURE__ */ xn.createElement("div", { className: "relative w-full pb-8" }, /* @__PURE__ */ xn.createElement("div", { className: "relative w-full px-4 pt-6 pb-4 bg-gradient-to-b from-[#2E2740] to-transparent" }, /* @__PURE__ */ xn.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ xn.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ xn.createElement(
      "img",
      {
        src: userAvatar,
        alt: userName,
        className: "w-12 h-12 rounded-full border-2 border-solid border-white/20"
      }
    ), /* @__PURE__ */ xn.createElement("span", { className: "font-jakarta font-semibold text-lg text-white" }, userName)), /* @__PURE__ */ xn.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => sendToBubble("send"),
        className: "w-10 h-10 rounded-full border border-solid border-white/30 flex items-center justify-center hover:bg-white/10 transition-all"
      },
      /* @__PURE__ */ xn.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("line", { x1: "22", y1: "2", x2: "11", y2: "13" }), /* @__PURE__ */ xn.createElement("polygon", { points: "22 2 15 22 11 13 2 9 22 2" }))
    ), /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => sendToBubble("chat"),
        className: "w-10 h-10 rounded-full border border-solid border-white/30 flex items-center justify-center hover:bg-white/10 transition-all"
      },
      /* @__PURE__ */ xn.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }))
    ), /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => sendToBubble("notifications"),
        className: "relative w-10 h-10 rounded-full bg-[#FF2258] flex items-center justify-center hover:bg-[#FF2258]/90 transition-all"
      },
      /* @__PURE__ */ xn.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("path", { d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" }), /* @__PURE__ */ xn.createElement("path", { d: "M13.73 21a2 2 0 0 1-3.46 0" })),
      /* @__PURE__ */ xn.createElement("span", { className: "absolute -top-1 -right-1 w-5 h-5 bg-[#FF2258] border-2 border-solid border-[#2E2740] rounded-full flex items-center justify-center" }, /* @__PURE__ */ xn.createElement("span", { className: "font-jakarta font-bold text-[10px] text-white" }, credits))
    )))), /* @__PURE__ */ xn.createElement("div", { className: "px-4 mt-8" }, /* @__PURE__ */ xn.createElement("h2", { className: "font-jakarta font-semibold text-xs text-white/70 tracking-[0.1em] uppercase mb-4" }, "PERSONALIZED JOURNEYS"), /* @__PURE__ */ xn.createElement("div", { className: "relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#AD256C] to-[#8B1F57] p-6 shadow-lg" }, /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => sendToBubble("previous_journey"),
        className: "absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all z-10"
      },
      /* @__PURE__ */ xn.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "3" }, /* @__PURE__ */ xn.createElement("polyline", { points: "15 18 9 12 15 6" }))
    ), /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => sendToBubble("next_journey"),
        className: "absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all z-10"
      },
      /* @__PURE__ */ xn.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "3" }, /* @__PURE__ */ xn.createElement("polyline", { points: "9 18 15 12 9 6" }))
    ), /* @__PURE__ */ xn.createElement("div", { className: "px-8" }, /* @__PURE__ */ xn.createElement("h3", { className: "font-jakarta font-bold text-2xl text-white mb-4 text-center" }, currentJourney.title), /* @__PURE__ */ xn.createElement("div", { className: "bg-[#2E2740] rounded-xl p-4 mb-6" }, /* @__PURE__ */ xn.createElement("p", { className: "font-poppins text-sm text-white/90 leading-relaxed" }, currentJourney.description)), /* @__PURE__ */ xn.createElement("div", { className: "flex items-center justify-center gap-3" }, /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => push("details", { title: currentJourney.title }),
        className: "px-8 py-3 bg-[#FF2258] rounded-full font-jakarta font-semibold text-sm text-white hover:bg-[#FF2258]/90 transition-all btn-pressed"
      },
      "Select (Push Test)"
    ), /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => sendToBubble("change_topic"),
        className: "px-6 py-3 border border-solid border-white/50 rounded-full font-jakarta font-medium text-sm text-white hover:bg-white/10 transition-all flex items-center gap-2"
      },
      /* @__PURE__ */ xn.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("polyline", { points: "1 4 1 10 7 10" }), /* @__PURE__ */ xn.createElement("polyline", { points: "23 20 23 14 17 14" }), /* @__PURE__ */ xn.createElement("path", { d: "M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" })),
      "Topic"
    ))))), /* @__PURE__ */ xn.createElement("div", { className: "px-4 mt-8" }, /* @__PURE__ */ xn.createElement("h2", { className: "font-jakarta font-semibold text-xs text-white/70 tracking-[0.1em] uppercase mb-4" }, "QUICK STEPS"), /* @__PURE__ */ xn.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ xn.createElement(
      "div",
      {
        className: "relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6D6987] to-[#4A4660] p-6 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform",
        onClick: () => sendToBubble("conversation_coach")
      },
      /* @__PURE__ */ xn.createElement("div", { className: "absolute -top-1 -right-1 w-20 h-20 overflow-hidden" }, /* @__PURE__ */ xn.createElement("div", { className: "absolute top-4 -right-8 w-32 bg-[#E76B0C] text-white text-center font-jakarta font-bold text-xs py-1 transform rotate-45 shadow-lg" }, "NEW")),
      /* @__PURE__ */ xn.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ xn.createElement("div", { className: "w-12 h-12 rounded-full bg-[#E76B0C] flex items-center justify-center flex-shrink-0" }, /* @__PURE__ */ xn.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }))), /* @__PURE__ */ xn.createElement("div", null, /* @__PURE__ */ xn.createElement("h3", { className: "font-jakarta font-bold text-lg text-white" }, "Conversation"), /* @__PURE__ */ xn.createElement("h3", { className: "font-jakarta font-bold text-lg text-white" }, "Coach")))
    ), /* @__PURE__ */ xn.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ xn.createElement(
      "div",
      {
        className: "rounded-2xl overflow-hidden bg-gradient-to-br from-[#AD256C] to-[#8B1F57] p-5 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform",
        onClick: () => sendToBubble("practical_actions")
      },
      /* @__PURE__ */ xn.createElement("div", { className: "flex flex-col items-start gap-2" }, /* @__PURE__ */ xn.createElement("div", { className: "w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" }, /* @__PURE__ */ xn.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("polyline", { points: "9 11 12 14 22 4" }), /* @__PURE__ */ xn.createElement("path", { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" }))), /* @__PURE__ */ xn.createElement("h3", { className: "font-jakarta font-bold text-base text-white leading-tight" }, "Practical", /* @__PURE__ */ xn.createElement("br", null), "Actions"))
    ), /* @__PURE__ */ xn.createElement(
      "div",
      {
        className: "rounded-2xl overflow-hidden bg-gradient-to-br from-[#4A7C9E] to-[#3A5F7D] p-5 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform",
        onClick: () => sendToBubble("ask_question")
      },
      /* @__PURE__ */ xn.createElement("div", { className: "flex flex-col items-start gap-2" }, /* @__PURE__ */ xn.createElement("div", { className: "w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" }, /* @__PURE__ */ xn.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ xn.createElement("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }), /* @__PURE__ */ xn.createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17" }))), /* @__PURE__ */ xn.createElement("h3", { className: "font-jakarta font-bold text-base text-white leading-tight" }, "Ask a", /* @__PURE__ */ xn.createElement("br", null), "Question"))
    )))));
  };
  var HomeSection_default = HomeSection;

  // src/App.jsx
  var PlaceholderSection = ({ title }) => /* @__PURE__ */ xn.createElement("div", { className: "p-8 text-white text-center" }, /* @__PURE__ */ xn.createElement("h2", { className: "text-2xl font-bold mb-4" }, title), /* @__PURE__ */ xn.createElement("p", { className: "opacity-70" }, "Coming Soon"));
  var App = () => {
    const [activeTab, setActiveTab] = d2("home");
    const [stacks, setStacks] = d2({
      home: ["home"],
      learn: ["learn"],
      act: ["act"],
      ask: ["ask"]
    });
    const [userProps, setUserProps] = d2({
      userName: "Jonathan",
      userAvatar: "https://i.pravatar.cc/150?img=12",
      credits: 23
    });
    y2(() => {
    }, []);
    const push = (viewId, props = {}) => {
      setStacks((prev) => ({
        ...prev,
        [activeTab]: [...prev[activeTab], { id: viewId, ...props }]
      }));
    };
    const pop = () => {
      setStacks((prev) => {
        const currentStack2 = prev[activeTab];
        if (currentStack2.length <= 1) return prev;
        return {
          ...prev,
          [activeTab]: currentStack2.slice(0, -1)
        };
      });
    };
    const switchTab = (tabId) => {
      setActiveTab(tabId);
    };
    const currentStack = stacks[activeTab];
    const currentViewItem = currentStack[currentStack.length - 1];
    const currentViewId = typeof currentViewItem === "string" ? currentViewItem : currentViewItem.id;
    const currentViewProps = typeof currentViewItem === "object" ? currentViewItem : {};
    const renderView = () => {
      const commonProps = {
        ...userProps,
        push,
        pop,
        ...currentViewProps
        // Merge specific props for this view
      };
      switch (activeTab) {
        case "home":
          if (currentViewId === "home") return /* @__PURE__ */ xn.createElement(HomeSection_default, { ...commonProps });
          if (currentViewId === "details") return /* @__PURE__ */ xn.createElement(PlaceholderSection, { title: "Details View (Pushed)", ...commonProps });
          return /* @__PURE__ */ xn.createElement(PlaceholderSection, { title: "Unknown View" });
        case "learn":
          return /* @__PURE__ */ xn.createElement(PlaceholderSection, { title: "Learn" });
        case "act":
          return /* @__PURE__ */ xn.createElement(PlaceholderSection, { title: "Act" });
        case "ask":
          return /* @__PURE__ */ xn.createElement(PlaceholderSection, { title: "Ask" });
        default:
          return /* @__PURE__ */ xn.createElement(PlaceholderSection, { title: "Not Found" });
      }
    };
    const NavButton = ({ id, label, icon }) => {
      const isActive = activeTab === id;
      return /* @__PURE__ */ xn.createElement(
        "button",
        {
          onClick: () => switchTab(id),
          className: `flex flex-col items-center justify-center gap-1 transition-all duration-300 ease-out transform ${isActive ? "text-[#FF2258] font-bold scale-110 active-tab-shimmer" : "text-white/60 font-medium scale-100 opacity-70"}`
        },
        icon,
        /* @__PURE__ */ xn.createElement("span", { className: "font-jakarta text-[10px] tracking-wide" }, label)
      );
    };
    const Icons = {
      home: /* @__PURE__ */ xn.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }), /* @__PURE__ */ xn.createElement("polyline", { points: "9 22 9 12 15 12 15 22" })),
      learn: /* @__PURE__ */ xn.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }), /* @__PURE__ */ xn.createElement("path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" })),
      act: /* @__PURE__ */ xn.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("polyline", { points: "9 11 12 14 22 4" }), /* @__PURE__ */ xn.createElement("path", { d: "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" })),
      ask: /* @__PURE__ */ xn.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }))
    };
    return /* @__PURE__ */ xn.createElement("div", { className: "relative w-full h-full bg-gradient-to-b from-[#2E2740] to-[#1F1A2E] font-poppins overflow-hidden flex flex-col" }, /* @__PURE__ */ xn.createElement("div", { className: "flex-1 overflow-y-auto pb-20 scrollbar-hide relative" }, currentStack.length > 1 && /* @__PURE__ */ xn.createElement("div", { className: "absolute top-4 left-4 z-50" }, /* @__PURE__ */ xn.createElement("button", { onClick: pop, className: "bg-black/20 p-2 rounded-full backdrop-blur-md text-white" }, /* @__PURE__ */ xn.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ xn.createElement("polyline", { points: "15 18 9 12 15 6" })))), renderView()), /* @__PURE__ */ xn.createElement("div", { className: "absolute bottom-0 left-0 right-0 h-20 bg-[#1F1A2E]/95 backdrop-blur-md border-t border-solid border-white/10 z-50" }, /* @__PURE__ */ xn.createElement("div", { className: "flex items-center justify-around h-full max-w-[500px] mx-auto px-4" }, /* @__PURE__ */ xn.createElement(NavButton, { id: "home", label: "Home", icon: Icons.home }), /* @__PURE__ */ xn.createElement(NavButton, { id: "learn", label: "Learn", icon: Icons.learn }), /* @__PURE__ */ xn.createElement(NavButton, { id: "act", label: "Act", icon: Icons.act }), /* @__PURE__ */ xn.createElement(NavButton, { id: "ask", label: "Ask", icon: Icons.ask }))));
  };
  var App_default = App;

  // src/components/WelcomeScreen.jsx
  var WelcomeScreen = () => {
    const bgImage = "https://0fc323560b9c4d8afc3a7d487716abb6.cdn.bubble.io/f1744960311608x780031988693140400/BG%20%281%29.png?_gl=1*1sjnvjs*_gcl_au*MTI1MTA4NjA5OS4xNzY0NjcxNTYy*_ga*MTkwNzcwNjAyMy4xNzY0MTUwMzM2*_ga_BFPVR2DEE2*czE3NzA4ODE1ODYkbzYyJGcxJHQxNzcwODk2MDU5JGoyMyRsMCRoMA..";
    const sendToBubble = (action) => {
      if (window.BubbleBridge) {
        window.BubbleBridge.send("bubble_fn_welcome", { action });
      }
    };
    return /* @__PURE__ */ xn.createElement("div", { className: "relative w-full h-full min-h-screen bg-black font-jakarta overflow-hidden" }, /* @__PURE__ */ xn.createElement("div", { className: "absolute inset-0 z-0" }, /* @__PURE__ */ xn.createElement("img", { src: bgImage, className: "w-full h-full object-cover opacity-80", alt: "Couple" }), /* @__PURE__ */ xn.createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" })), /* @__PURE__ */ xn.createElement("div", { className: "relative z-10 flex flex-col h-full px-6 pb-12 pt-20" }, /* @__PURE__ */ xn.createElement("div", { className: "mx-auto mb-auto flex flex-col items-center" }, /* @__PURE__ */ xn.createElement("svg", { width: "64", height: "64", viewBox: "0 0 64 64", fill: "none" }, /* @__PURE__ */ xn.createElement("circle", { cx: "32", cy: "32", r: "32", fill: "white" }), /* @__PURE__ */ xn.createElement("rect", { x: "19", y: "19", width: "26", height: "26", fill: "#FF2258" })), /* @__PURE__ */ xn.createElement("div", { className: "text-white text-center mt-2 font-bold tracking-widest text-xs" }, "BONDS")), /* @__PURE__ */ xn.createElement("div", { className: "mb-8" }, /* @__PURE__ */ xn.createElement("h1", { className: "text-white text-[34px] leading-[40px] font-normal mb-4" }, "Your Relationship", /* @__PURE__ */ xn.createElement("br", null), "Superpower"), /* @__PURE__ */ xn.createElement("p", { className: "text-white/80 text-lg font-light" }, "We learn your dynamics and tailor expert built, AI powered insights & actions")), /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => sendToBubble("go"),
        className: "w-full h-[60px] rounded-[40px] bg-gradient-to-l from-[#B900B0] to-[#D8003F] flex items-center justify-center mb-6 shadow-lg transform transition active:scale-95 btn-pressed"
      },
      /* @__PURE__ */ xn.createElement("span", { className: "font-jakarta font-semibold text-[20px] text-white tracking-[3px] uppercase" }, "LET\u2019S GO")
    ), /* @__PURE__ */ xn.createElement("div", { className: "text-center" }, /* @__PURE__ */ xn.createElement("span", { className: "font-jakarta text-[17px] text-white tracking-[0.2px]" }, "Got an account? ", " ", /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: () => sendToBubble("signin"),
        className: "font-bold border-b border-white hover:opacity-80 transition"
      },
      "Sign In here"
    )))));
  };
  var WelcomeScreen_default = WelcomeScreen;

  // src/components/DailyQuestion.jsx
  var DailyQuestion = ({ category, question, options, userName, credits: initialCredits, selectedAnswer: initialSelectedAnswer }) => {
    const [credits, setCredits] = d2(initialCredits || 0);
    const [selectedAnswer, setSelectedAnswer] = d2(initialSelectedAnswer);
    const [isVoted, setIsVoted] = d2(initialSelectedAnswer !== void 0 && initialSelectedAnswer !== null);
    const [showFooterAfter, setShowFooterAfter] = d2(isVoted);
    const creditsCircleRef = A2(null);
    const creditsNumberRef = A2(null);
    const handleVote = (answerText, index) => {
      if (isVoted) return;
      setIsVoted(true);
      setSelectedAnswer(index);
      setTimeout(() => {
        setShowFooterAfter(true);
      }, 800);
      if (window.BubbleBridge) {
        window.BubbleBridge.send("bubble_fn_daily_question", {
          action: "vote",
          answer: answerText,
          index
        });
      }
      setTimeout(() => {
        triggerCreditAnimation();
      }, 2e3);
    };
    const triggerCreditAnimation = () => {
      const dimOverlay = document.createElement("div");
      dimOverlay.className = "dim-overlay active";
      document.body.appendChild(dimOverlay);
      const overlay = document.createElement("div");
      overlay.className = "credit-overlay credit-center-animation";
      overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            pointer-events: none;
        `;
      overlay.innerHTML = `
            <div class="w-24 h-24 bg-[#FF2258] rounded-full flex items-center justify-center shadow-2xl">
                <span id="overlayCreditsNumber" class="font-jakarta font-extrabold text-4xl text-white tracking-wide leading-none">
                    ${credits}
                </span>
            </div>
        `;
      document.body.appendChild(overlay);
      setTimeout(() => {
        const overlayNum = document.getElementById("overlayCreditsNumber");
        let start = credits;
        let end = credits + 1;
        let duration = 600;
        let startTime = null;
        function animateNumber(timestamp) {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const current = Math.round(start + (end - start) * easeOutQuart);
          if (overlayNum) overlayNum.innerText = current;
          if (progress < 1) requestAnimationFrame(animateNumber);
        }
        requestAnimationFrame(animateNumber);
      }, 600);
      setTimeout(() => {
        overlay.classList.remove("credit-center-animation");
        overlay.classList.add("credit-move-animation");
        dimOverlay.classList.remove("active");
        overlay.offsetHeight;
        if (creditsCircleRef.current) {
          const targetRect = creditsCircleRef.current.getBoundingClientRect();
          overlay.style.top = targetRect.top + "px";
          overlay.style.left = targetRect.left + "px";
          overlay.style.transform = "scale(1)";
          const overlayCircle = overlay.querySelector("div");
          overlayCircle.style.transition = "all 600ms cubic-bezier(0.4, 0, 0.2, 1)";
          overlayCircle.style.width = "32px";
          overlayCircle.style.height = "32px";
          overlayCircle.querySelector("span").style.fontSize = "0.75rem";
        }
      }, 1200);
      setTimeout(() => {
        setCredits((prev) => prev + 1);
        if (creditsCircleRef.current) {
          creditsCircleRef.current.style.transition = "transform 0.3s ease";
          creditsCircleRef.current.style.transform = "translateY(-50%) scale(1.2)";
          setTimeout(() => {
            if (creditsCircleRef.current) {
              creditsCircleRef.current.style.transform = "translateY(-50%) scale(1)";
            }
          }, 300);
        }
        overlay.remove();
        dimOverlay.remove();
      }, 1800);
    };
    const handleStart = () => {
      if (window.BubbleBridge) {
        window.BubbleBridge.send("bubble_fn_daily_question", { action: "start_planning", timestamp: /* @__PURE__ */ new Date() });
      }
    };
    const handleClose = () => {
      if (window.BubbleBridge) {
        window.BubbleBridge.send("bubble_fn_daily_question", { action: "close" });
      }
    };
    return /* @__PURE__ */ xn.createElement("div", { className: "relative w-full min-h-screen overflow-hidden gradient-purple-orange font-poppins" }, /* @__PURE__ */ xn.createElement("div", { className: "absolute top-0 left-0 w-full z-20 pointer-events-none" }, /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: handleClose,
        className: "pointer-events-auto absolute top-[18px] left-[18px] w-8 h-8 flex items-center justify-center hover:opacity-80 transition-opacity z-20"
      },
      /* @__PURE__ */ xn.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none" }, /* @__PURE__ */ xn.createElement("path", { d: "M13.6675 1.99162C14.1108 1.53601 14.1108 0.79732 13.6675 0.341709C13.2243 -0.113903 12.5056 -0.113903 12.0623 0.341709L7 5.54491L1.9377 0.341709C1.49442 -0.113903 0.775732 -0.113903 0.332457 0.341708C-0.110818 0.79732 -0.110818 1.53601 0.332457 1.99162L5.20521 7L0.332456 12.0084C-0.110819 12.464 -0.110819 13.2027 0.332456 13.6583C0.77573 14.1139 1.49442 14.1139 1.93769 13.6583L7 8.45509L12.0623 13.6583C12.5056 14.1139 13.2243 14.1139 13.6675 13.6583C14.1108 13.2027 14.1108 12.464 13.6675 12.0084L8.79479 7L13.6675 1.99162Z", fill: "white" }))
    ), /* @__PURE__ */ xn.createElement("div", { className: "absolute top-4 -right-[95px] z-10" }, /* @__PURE__ */ xn.createElement("div", { className: "relative w-[180px] h-10 rounded-full flex items-center border border-solid border-white/50" }, /* @__PURE__ */ xn.createElement(
      "div",
      {
        ref: creditsCircleRef,
        id: "creditsCircle",
        className: "absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF2258] rounded-full flex items-center justify-center shadow-lg"
      },
      /* @__PURE__ */ xn.createElement("span", { className: "font-jakarta font-extrabold text-xs text-white tracking-wide leading-none" }, credits)
    ), /* @__PURE__ */ xn.createElement("span", { className: "absolute left-[42px] top-1/2 translate-y-[6px] font-jakarta font-medium text-[10px] text-white tracking-wide leading-none" }, "Credits")))), /* @__PURE__ */ xn.createElement("div", { className: "px-9 pt-[78px] max-w-[375px] mx-auto relative z-10" }, /* @__PURE__ */ xn.createElement("div", { className: "font-jakarta font-medium text-lg text-white mb-[68px]" }, category || "Time Together"), /* @__PURE__ */ xn.createElement("div", { className: "font-poppins font-semibold text-xl text-white leading-[30px] tracking-[0.02em] mb-10 max-w-[303px]" }, question), /* @__PURE__ */ xn.createElement("div", { className: "space-y-[19px] mb-16" }, options.map((opt, i3) => {
      const optIndex = opt.index !== void 0 ? opt.index : i3 + 1;
      const isSelected = isVoted && selectedAnswer === optIndex;
      return /* @__PURE__ */ xn.createElement(
        "div",
        {
          key: optIndex,
          className: `daily-question-option relative w-full max-w-[315px] h-9 bg-white/5 border border-solid border-white/10 backdrop-blur-md rounded-lg cursor-pointer overflow-hidden transition-all duration-300 hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${isVoted ? "voted pointer-events-none" : ""} ${isSelected ? "selected-option" : ""}`,
          onClick: () => handleVote(opt.text, optIndex)
        },
        /* @__PURE__ */ xn.createElement(
          "div",
          {
            className: "option-bar absolute left-0 top-0 h-full bg-[#6D6987]/70 rounded-lg",
            style: { width: isVoted ? `${opt.percent}%` : "0%" }
          }
        ),
        /* @__PURE__ */ xn.createElement("div", { className: "relative flex items-center justify-between h-full px-[42px] z-10" }, /* @__PURE__ */ xn.createElement("span", { className: "font-poppins font-bold text-sm text-[#F8F8F8] tracking-[0.02em]" }, opt.text), /* @__PURE__ */ xn.createElement(
          "span",
          {
            className: `percentage font-poppins text-xs text-[#F8F8F8] tracking-[0.02em] ${isVoted ? "opacity-100" : "opacity-0"}`,
            style: { fontWeight: isSelected ? "bold" : "normal" }
          },
          opt.percent,
          "%"
        ))
      );
    })), /* @__PURE__ */ xn.createElement("div", { className: "min-h-[100px] flex flex-col items-center justify-start" }, !showFooterAfter ? /* @__PURE__ */ xn.createElement("div", { className: "font-poppins text-base text-white text-center leading-6 tracking-[0.02em] max-w-[295px]" }, "Vote and see the live results and also gain 1 credits") : /* @__PURE__ */ xn.createElement(xn.Fragment, null, /* @__PURE__ */ xn.createElement("div", { className: "font-poppins text-base text-white text-center leading-6 tracking-[0.02em] max-w-[309px] mb-6 animate-fade-in" }, /* @__PURE__ */ xn.createElement("span", { className: "font-bold" }, userName), ", we would love to plan with you that first step to creating more 'you time'"), /* @__PURE__ */ xn.createElement(
      "button",
      {
        onClick: handleStart,
        className: "px-10 py-3 bg-white rounded-[64px] btn-pressed animate-fade-in pointer-events-auto"
      },
      /* @__PURE__ */ xn.createElement("span", { className: "font-jakarta font-semibold text-[17px] text-[#E76B0C] tracking-[0.7px] pointer-events-none" }, "Start")
    )))));
  };
  var DailyQuestion_default = DailyQuestion;

  // src/index.jsx
  window.appUI = window.appUI || {};
  var initGlobals = () => {
    const fonts = [
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
    ];
    fonts.forEach((url) => {
      if (!document.querySelector(`link[href="${url}"]`)) {
        const link = document.createElement("link");
        link.href = url;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    });
    window.BubbleBridge = {
      send: (fnName, data) => {
        const payload = typeof data === "object" && data !== null ? JSON.stringify(data) : data;
        console.log(`\u{1F4E4} Sending to Bubble [${fnName}]:`, payload);
        if (window[fnName]) window[fnName](payload);
      }
    };
    console.log("\u{1F30D} Globals Initialized");
  };
  initGlobals();
  window.appUI.mountMainApp = (container) => {
    const root = createRoot(container);
    root.render(/* @__PURE__ */ xn.createElement(App_default, null));
    return root;
  };
  window.appUI.mountWelcome = (container, props = {}) => {
    const root = createRoot(container);
    root.render(/* @__PURE__ */ xn.createElement(WelcomeScreen_default, { ...props }));
    return root;
  };
  window.appUI.mountDailyQuestion = (container, props = {}) => {
    const root = createRoot(container);
    root.render(/* @__PURE__ */ xn.createElement(DailyQuestion_default, { ...props }));
    return root;
  };
  if (!document.getElementById("component-selector")) {
    let container = document.getElementById("app-content-area");
    if (!container) {
      container = document.createElement("div");
      container.id = "react-root";
      container.style.height = "100%";
      container.style.width = "100%";
      document.body.appendChild(container);
    }
    window.appUI.mountMainApp(container);
    console.log("\u{1F680} Main App Auto-Mounted");
  } else {
    console.log("\u{1F6E0}\uFE0F Preview Mode detected: Waiting for manual mount.");
  }
})();
