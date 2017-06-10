
function js_beautify(js_source_text, indent_size, indent_character, indent_level)
{
  var input, output, token_text, last_type, last_text, last_word, current_mode, modes, indent_string;
  var whitespace, wordchar, punct, parser_pos, line_starters, in_case;
  var prefix, token_type, do_block_just_closed, var_line, var_line_tainted, if_line_flag;
  function trim_output()
  {
    while (output.length && (output[output.length - 1] === ' ' || output[output.length - 1] === indent_string)) {
      output.pop();
    }
  }
  function print_newline(ignore_repeated)
  {
    ignore_repeated = typeof ignore_repeated === 'undefined' ? true: ignore_repeated;
    if_line_flag = false;
    trim_output();
    if (!output.length) {
      return; // no newline on start of file
    }
    if (output[output.length - 1] !== "\n" || !ignore_repeated) {
      output.push("\n");
    }
    for (var i = 0; i < indent_level; i++) {
      output.push(indent_string);
    }
  }

  function print_space()
  {
    var last_output = output.length ? output[output.length - 1] : ' ';
    if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
      output.push(' ');
    }
  }

  function print_token()
  {
    output.push(token_text);
  }
  function indent()
  {
    indent_level++;
  }

  function unindent()
  {
    if (indent_level) {
      indent_level--;
    }
  }

  function remove_indent()
  {
    if (output.length && output[output.length - 1] === indent_string) {
      output.pop();
    }
  }

  function set_mode(mode)
  {
    modes.push(current_mode);
    current_mode = mode;
  }

  function restore_mode()
  {
    do_block_just_closed = current_mode === 'DO_BLOCK';
    current_mode = modes.pop();
  }

  function in_array(what, arr)
  {
    for (var i = 0; i < arr.length; i++)
    {
      if (arr[i] === what) {
        return true;
      }
    }
    return false;
  }

  function get_next_token()
  {
    var n_newlines = 0;
    var c = '';
    do {
      if (parser_pos >= input.length) {
        return ['', 'TK_EOF'];
      }
      c = input.charAt(parser_pos);
      parser_pos += 1;
      if (c === "\n") {
        n_newlines += 1;
      }
    }
    while (in_array(c, whitespace));
    if (n_newlines > 1) {
      for (var i = 0; i < 2; i++) {
        print_newline(i === 0);
      }
    }
    var wanted_newline = (n_newlines === 1);

    if (in_array(c, wordchar)) {
      if (parser_pos < input.length) {
        while (in_array(input.charAt(parser_pos), wordchar)) {
          c += input.charAt(parser_pos);
          parser_pos += 1;
          if (parser_pos === input.length) {
            break;
          }
        }
      }
      // small and surprisingly unugly hack for 1E-10 representation
      if (parser_pos !== input.length && c.match(/^[0-9]+[Ee]$/) && input.charAt(parser_pos) === '-') {
        parser_pos += 1;
        var t = get_next_token(parser_pos);
        c += '-' + t[0];
        return [c, 'TK_WORD'];
      }
      if (c === 'in') { // hack for 'in' operator
        return [c, 'TK_OPERATOR'];
      }
      if (wanted_newline && last_type !== 'TK_OPERATOR' && !if_line_flag) {
        print_newline();
      }
      return [c, 'TK_WORD'];
    }
    if (c === '(' || c === '[') {
      return [c, 'TK_START_EXPR'];
    }
    if (c === ')' || c === ']') {
      return [c, 'TK_END_EXPR'];
    }
    if (c === '{') {
      return [c, 'TK_START_BLOCK'];
    }
    if (c === '}') {
      return [c, 'TK_END_BLOCK'];
    }
    if (c === ';') {
      return [c, 'TK_SEMICOLON'];
    }
    if (c === '/') {
      var comment = '';
      // peek for comment /* ... */
      if (input.charAt(parser_pos) === '*') {
        parser_pos += 1;
        if (parser_pos < input.length) {
          while (! (input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/') && parser_pos < input.length) {
            comment += input.charAt(parser_pos);
            parser_pos += 1;
            if (parser_pos >= input.length) {
              break;
            }
          }
        }
        parser_pos += 2;
        return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
      }
      // peek for comment // ...
      if (input.charAt(parser_pos) === '/') {
        comment = c;
        while (input.charAt(parser_pos) !== "\x0d" && input.charAt(parser_pos) !== "\x0a") {
          comment += input.charAt(parser_pos);
          parser_pos += 1;
          if (parser_pos >= input.length) {
            break;
          }
        }
        parser_pos += 1;
        if (wanted_newline) {
          print_newline();
        }
        return [comment, 'TK_COMMENT'];
      }
    }
    if (c === "'" || // string
      c === '"' || // string
      (c === '/' &&
      ((last_type === 'TK_WORD' && last_text === 'return') || (last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) { // regexp
      var sep = c;
      var esc = false;
      var resulting_string = '';
      if (parser_pos < input.length) {
        while (esc || input.charAt(parser_pos) !== sep) {
          resulting_string += input.charAt(parser_pos);
          if (!esc) {
            esc = input.charAt(parser_pos) === '\\';
          } else {
            esc = false;
          }
          parser_pos += 1;
          if (parser_pos >= input.length) {
            break;
          }
        }
      }
      parser_pos += 1;
      resulting_string = sep + resulting_string + sep;
      if (sep == '/') {
        // regexps may have modifiers /regexp/MOD , so fetch those, too
        while (parser_pos < input.length && in_array(input.charAt(parser_pos), wordchar)) {
          resulting_string += input.charAt(parser_pos);
          parser_pos += 1;
        }
      }
      return [resulting_string, 'TK_STRING'];
    }
    if (in_array(c, punct)) {
      while (parser_pos < input.length && in_array(c + input.charAt(parser_pos), punct)) {
        c += input.charAt(parser_pos);
        parser_pos += 1;
        if (parser_pos >= input.length) {
          break;
        }
      }
      return [c, 'TK_OPERATOR'];
    }
    return [c, 'TK_UNKNOWN'];
  }

  //----------------------------------
  indent_character = indent_character || ' ';
  indent_size = indent_size || 4;
  indent_string = '';
  while (indent_size--) {
    indent_string += indent_character;
  }
  input = js_source_text;
  last_word = ''; // last 'TK_WORD' passed
  last_type = 'TK_START_EXPR'; // last token type
  last_text = ''; // last token text
  output = [];
  do_block_just_closed = false;
  var_line = false;
  var_line_tainted = false;
  whitespace = "\n\r\t ".split('');
  wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
  punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |='.split(' ');
  // words which should always start on new line.
  line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');
  // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
  // some formatting depends on that.
  current_mode = 'BLOCK';
  modes = [current_mode];
  indent_level = indent_level || 0;
  parser_pos = 0; // parser position
  in_case = false; // flag for parser that case/default has been processed, and next colon needs special attention
  while (true) {
    var t = get_next_token(parser_pos);
    token_text = t[0];
    token_type = t[1];
    if (token_type === 'TK_EOF') {
      break;
    }
    switch (token_type) {
      case 'TK_START_EXPR':
        var_line = false;
        set_mode('EXPRESSION');
        if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR') {
          // do nothing on (( and )( and ][ and ]( ..
        } else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
          print_space();
        } else if (in_array(last_word, line_starters) && last_word !== 'function') {
          print_space();
        }
        print_token();
        break;
      case 'TK_END_EXPR':
        print_token();
        restore_mode();
        break;
      case 'TK_START_BLOCK':
        if (last_word === 'do') {
          set_mode('DO_BLOCK');
        } else {
          set_mode('BLOCK');
        }
        if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
          if (last_type === 'TK_START_BLOCK') {
            print_newline();
          } else {
            print_space();
          }
        }
        print_token();
        indent();
        break;
      case 'TK_END_BLOCK':
        if (last_type === 'TK_START_BLOCK') {
          // nothing
          trim_output();
          unindent();
        } else {
          unindent();
          print_newline();
        }
        print_token();
        restore_mode();
        break;
      case 'TK_WORD':
        if (do_block_just_closed) {
          print_space();
          print_token();
          print_space();
          break;
        }
        if (token_text === 'case' || token_text === 'default') {
          if (last_text === ':') {
            // switch cases following one another
            remove_indent();
          } else {
            // case statement starts in the same line where switch
            unindent();
            print_newline();
            indent();
          }
          print_token();
          in_case = true;
          break;
        }
        prefix = 'NONE';
        if (last_type === 'TK_END_BLOCK') {
          if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
            prefix = 'NEWLINE';
          } else {
            prefix = 'SPACE';
            print_space();
          }
        } else if (last_type === 'TK_SEMICOLON' && (current_mode === 'BLOCK' || current_mode === 'DO_BLOCK')) {
          prefix = 'NEWLINE';
        } else if (last_type === 'TK_SEMICOLON' && current_mode === 'EXPRESSION') {
          prefix = 'SPACE';
        } else if (last_type === 'TK_STRING') {
          prefix = 'NEWLINE';
        } else if (last_type === 'TK_WORD') {
          prefix = 'SPACE';
        } else if (last_type === 'TK_START_BLOCK') {
          prefix = 'NEWLINE';
        } else if (last_type === 'TK_END_EXPR') {
          print_space();
          prefix = 'NEWLINE';
        }
        if (last_type !== 'TK_END_BLOCK' && in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
          print_newline();
        } else if (in_array(token_text, line_starters) || prefix === 'NEWLINE') {
          if (last_text === 'else') {
            // no need to force newline on else break
            print_space();
          } else if ((last_type === 'TK_START_EXPR' || last_text === '=') && token_text === 'function') {
            // no need to force newline on 'function': (function
            // DONOTHING
          } else if (last_type === 'TK_WORD' && (last_text === 'return' || last_text === 'throw')) {
            // no newline between 'return nnn'
            print_space();
          } else if (last_type !== 'TK_END_EXPR') {
            if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
              // no need to force newline on 'var': for (var x = 0...)
              if (token_text === 'if' && last_type === 'TK_WORD' && last_word === 'else') {
                // no newline for } else if {
                print_space();
              } else {
                print_newline();
              }
            }
          } else {
            if (in_array(token_text, line_starters) && last_text !== ')') {
              print_newline();
            }
          }
        } else if (prefix === 'SPACE') {
          print_space();
        }
        print_token();
        last_word = token_text;
        if (token_text === 'var') {
          var_line = true;
          var_line_tainted = false;
        }
        if (token_text === 'if' || token_text === 'else') {
          if_line_flag = true;
        }
        break;
      case 'TK_SEMICOLON':
        print_token();
        var_line = false;
        break;
      case 'TK_STRING':
        if (last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type == 'TK_SEMICOLON') {
          print_newline();
        } else if (last_type === 'TK_WORD') {
          print_space();
        }
        print_token();
        break;
      case 'TK_OPERATOR':
        var start_delim = true;
        var end_delim = true;
        if (var_line && token_text !== ',') {
          var_line_tainted = true;
          if (token_text === ':') {
            var_line = false;
          }
        }
        if (token_text === ':' && in_case) {
          print_token(); // colon really asks for separate treatment
          print_newline();
          break;
        }
        in_case = false;
        if (token_text === ',') {
          if (var_line) {
            if (var_line_tainted) {
              print_token();
              print_newline();
              var_line_tainted = false;
            } else {
              print_token();
              print_space();
            }
          } else if (last_type === 'TK_END_BLOCK') {
            print_token();
            print_newline();
          } else {
            if (current_mode === 'BLOCK') {
              print_token();
              print_newline();
            } else {
              // EXPR od DO_BLOCK
              print_token();
              print_space();
            }
          }
          break;
        } else if (token_text === '--' || token_text === '++') { // unary operators special case
          if (last_text === ';') {
            // space for (;; ++i)
            start_delim = true;
            end_delim = false;
          } else {
            start_delim = false;
            end_delim = false;
          }
        } else if (token_text === '!' && last_type === 'TK_START_EXPR') {
          // special case handling: if (!a)
          start_delim = false;
          end_delim = false;
        } else if (last_type === 'TK_OPERATOR') {
          start_delim = false;
          end_delim = false;
        } else if (last_type === 'TK_END_EXPR') {
          start_delim = true;
          end_delim = true;
        } else if (token_text === '.') {
          // decimal digits or object.property
          start_delim = false;
          end_delim = false;
        } else if (token_text === ':') {
          // zz: xx
          // can't differentiate ternary op, so for now it's a ? b: c; without space before colon
          if (last_text.match(/^\d+$/)) {
            // a little help for ternary a ? 1 : 0;
            start_delim = true;
          } else {
            start_delim = false;
          }
        }
        if (start_delim) {
          print_space();
        }
        print_token();
        if (end_delim) {
          print_space();
        }
        break;
      case 'TK_BLOCK_COMMENT':
        print_newline();
        print_token();
        print_newline();
        break;
      case 'TK_COMMENT':
        // print_newline();
        print_space();
        print_token();
        print_newline();
        break;
      case 'TK_UNKNOWN':
        print_token();
        break;
    }
    last_type = token_type;
    last_text = token_text;
  }
  return output.join('');
}

//-- Google Analytics Urchin Module
//-- Copyright 2007 Google, All Rights Reserved.
//-- Urchin On Demand Settings ONLY
var _uacct="";   // set up the Urchin Account
var _userv=1;   // service mode (0=local,1=remote,2=both)
//-- UTM User Settings
var _ufsc=1;   // set client info flag (1=on|0=off)
var _udn="auto";  // (auto|none|domain) set the domain name for cookies
var _uhash="on";  // (on|off) unique domain hash for cookies
var _utimeout="1800";    // set the inactive session timeout in seconds
var _ugifpath="/__utm.gif"; // set the web path to the __utm.gif file
var _utsp="|";   // transaction field separator
var _uflash=1;   // set flash version detect option (1=on|0=off)
var _utitle=1;   // set the document title detect option (1=on|0=off)
var _ulink=0;   // enable linker functionality (1=on|0=off)
var _uanchor=0;   // enable use of anchors for campaign (1=on|0=off)
var _utcp="/";   // the cookie path for tracking
var _usample=100;  // The sampling % of visitors to track (1-100).
//-- UTM Campaign Tracking Settings
var _uctm=1;   // set campaign tracking module (1=on|0=off)
var _ucto="15768000";  // set timeout in seconds (6 month default)
var _uccn="utm_campaign"; // name
var _ucmd="utm_medium";  // medium (cpc|cpm|link|email|organic)
var _ucsr="utm_source";  // source
var _uctr="utm_term";  // term/keyword
var _ucct="utm_content"; // content
var _ucid="utm_id";  // id number
var _ucno="utm_nooverride"; // don't override
//-- Auto/Organic Sources and Keywords
var _uOsr=new Array();
var _uOkw=new Array();
_uOsr[0]="google"; _uOkw[0]="q";
_uOsr[1]="yahoo"; _uOkw[1]="p";
_uOsr[2]="msn";  _uOkw[2]="q";
_uOsr[3]="aol";  _uOkw[3]="query";
_uOsr[4]="aol";  _uOkw[4]="encquery";
_uOsr[5]="lycos"; _uOkw[5]="query";
_uOsr[6]="ask";  _uOkw[6]="q";
_uOsr[7]="altavista"; _uOkw[7]="q";
_uOsr[8]="netscape"; _uOkw[8]="query";
_uOsr[9]="cnn"; _uOkw[9]="query";
_uOsr[10]="looksmart"; _uOkw[10]="qt";
_uOsr[11]="about"; _uOkw[11]="terms";
_uOsr[12]="mamma"; _uOkw[12]="query";
_uOsr[13]="alltheweb"; _uOkw[13]="q";
_uOsr[14]="gigablast"; _uOkw[14]="q";
_uOsr[15]="voila"; _uOkw[15]="rdata";
_uOsr[16]="virgilio"; _uOkw[16]="qs";
_uOsr[17]="live"; _uOkw[17]="q";
_uOsr[18]="baidu"; _uOkw[18]="wd";
_uOsr[19]="alice"; _uOkw[19]="qs";
_uOsr[20]="yandex"; _uOkw[20]="text";
_uOsr[21]="najdi"; _uOkw[21]="q";
_uOsr[22]="aol"; _uOkw[22]="q";
_uOsr[23]="club-internet"; _uOkw[23]="q";
_uOsr[24]="mama"; _uOkw[24]="query";
_uOsr[25]="seznam"; _uOkw[25]="q";
_uOsr[26]="search"; _uOkw[26]="q";
_uOsr[27]="szukaj"; _uOkw[27]="szukaj";
_uOsr[28]="szukaj"; _uOkw[28]="qt";
_uOsr[29]="netsprint"; _uOkw[29]="q";
_uOsr[30]="google.interia"; _uOkw[30]="q";
_uOsr[31]="szukacz"; _uOkw[31]="q";
_uOsr[32]="yam"; _uOkw[32]="k";
_uOsr[33]="pchome"; _uOkw[33]="q";

//-- Auto/Organic Keywords to Ignore
var _uOno=new Array();
//_uOno[0]="urchin";
//_uOno[1]="urchin.com";
//_uOno[2]="www.urchin.com";
//-- Referral domains to Ignore
var _uRno=new Array();
//_uRno[0]=".urchin.com";
//-- **** Don't modify below this point ***
var _uff,_udh,_udt,_ubl=0,_udo="",_uu,_ufns=0,_uns=0,_ur="-",_ufno=0,_ust=0/*,_ubd=document,_udl=_ubd.location*/,_udlh="",_uwv="1";
var _ugifpath2="http://www.google-analytics.com/__utm.gif";
//if (_udl.hash) _udlh=_udl.href.substring(_udl.href.indexOf('#'));
//if (_udl.protocol=="https:") _ugifpath2="https://ssl.google-analytics.com/__utm.gif";
if (!_utcp || _utcp=="") _utcp="/";
function urchinTracker(page) {
  if (_udl.protocol=="file:") return;
  if (_uff && (!page || page=="")) return;
  var a,b,c,xx,v,z,k,x="",s="",f=0;
  var nx=" expires="+_uNx()+";";
  var dc=_ubd.cookie;
  _udh=_uDomain();
  if (!_uVG()) return;
  _uu=Math.round(Math.random()*2147483647);
  _udt=new Date();
  _ust=Math.round(_udt.getTime()/1000);
  a=dc.indexOf("__utma="+_udh);
  b=dc.indexOf("__utmb="+_udh);
  c=dc.indexOf("__utmc="+_udh);
  if (_udn && _udn!="") { _udo=" domain="+_udn+";"; }
  if (_utimeout && _utimeout!="") {
    x=new Date(_udt.getTime()+(_utimeout*1000));
    x=" expires="+x.toGMTString()+";";
  }
  if (_ulink) {
    if (_uanchor && _udlh && _udlh!="") s=_udlh+"&";
    s+=_udl.search;
    if(s && s!="" && s.indexOf("__utma=")>=0) {
      if (!(_uIN(a=_uGC(s,"__utma=","&")))) a="-";
      if (!(_uIN(b=_uGC(s,"__utmb=","&")))) b="-";
      if (!(_uIN(c=_uGC(s,"__utmc=","&")))) c="-";
      v=_uGC(s,"__utmv=","&");
      z=_uGC(s,"__utmz=","&");
      k=_uGC(s,"__utmk=","&");
      xx=_uGC(s,"__utmx=","&");
      if ((k*1) != ((_uHash(a+b+c+xx+z+v)*1)+(_udh*1))) {_ubl=1;a="-";b="-";c="-";xx="-";z="-";v="-";}
      if (a!="-" && b!="-" && c!="-") f=1;
      else if(a!="-") f=2;
    }
  }
  if(f==1) {
    _ubd.cookie="__utma="+a+"; path="+_utcp+";"+nx+_udo;
    _ubd.cookie="__utmb="+b+"; path="+_utcp+";"+x+_udo;
    _ubd.cookie="__utmc="+c+"; path="+_utcp+";"+_udo;
  } else if (f==2) {
    a=_uFixA(s,"&",_ust);
    _ubd.cookie="__utma="+a+"; path="+_utcp+";"+nx+_udo;
    _ubd.cookie="__utmb="+_udh+"; path="+_utcp+";"+x+_udo;
    _ubd.cookie="__utmc="+_udh+"; path="+_utcp+";"+_udo;
    _ufns=1;
  } else if (a>=0 && b>=0 && c>=0) {
    _ubd.cookie="__utmb="+_udh+"; path="+_utcp+";"+x+_udo;
  } else {
    if (a>=0) a=_uFixA(_ubd.cookie,";",_ust);
    else a=_udh+"."+_uu+"."+_ust+"."+_ust+"."+_ust+".1";
    _ubd.cookie="__utma="+a+"; path="+_utcp+";"+nx+_udo;
    _ubd.cookie="__utmb="+_udh+"; path="+_utcp+";"+x+_udo;
    _ubd.cookie="__utmc="+_udh+"; path="+_utcp+";"+_udo;
    _ufns=1;
  }
  if (_ulink && xx && xx!="" && xx!="-") {
    xx=_uUES(xx);
    if (xx.indexOf(";")==-1) _ubd.cookie="__utmx="+xx+"; path="+_utcp+";"+nx+_udo;
  }
  if (_ulink && v && v!="" && v!="-") {
    v=_uUES(v);
    if (v.indexOf(";")==-1) _ubd.cookie="__utmv="+v+"; path="+_utcp+";"+nx+_udo;
  }
  _uInfo(page);
  _ufns=0;
  _ufno=0;
  if (!page || page=="") _uff=1;
}
function _uInfo(page) {
  var p,s="",dm="",pg=_udl.pathname+_udl.search;
  if (page && page!="") pg=_uES(page,1);
  _ur=_ubd.referrer;
  if (!_ur || _ur=="") { _ur="-"; }
  else {
    dm=_ubd.domain;
    if(_utcp && _utcp!="/") dm+=_utcp;
    p=_ur.indexOf(dm);
    if ((p>=0) && (p<=8)) { _ur="0"; }
    if (_ur.indexOf("[")==0 && _ur.lastIndexOf("]")==(_ur.length-1)) { _ur="-"; }
  }
  s+="&utmn="+_uu;
  if (_ufsc) s+=_uBInfo();
  if (_uctm) s+=_uCInfo();
  if (_utitle && _ubd.title && _ubd.title!="") s+="&utmdt="+_uES(_ubd.title);
  if (_udl.hostname && _udl.hostname!="") s+="&utmhn="+_uES(_udl.hostname);
  s+="&utmr="+_ur;
  s+="&utmp="+pg;
  if ((_userv==0 || _userv==2) && _uSP()) {
    var i=new Image(1,1);
    i.src=_ugifpath+"?"+"utmwv="+_uwv+s;
    i.onload=function() {_uVoid();}
  }
  if ((_userv==1 || _userv==2) && _uSP()) {
    var i2=new Image(1,1);
    i2.src=_ugifpath2+"?"+"utmwv="+_uwv+s+"&utmac="+_uacct+"&utmcc="+_uGCS();
    i2.onload=function() { _uVoid(); }
  }
  return;
}
function _uVoid() { return; }
function _uCInfo() {
  if (!_ucto || _ucto=="") { _ucto="15768000"; }
  if (!_uVG()) return;
  var c="",t="-",t2="-",t3="-",o=0,cs=0,cn=0,i=0,z="-",s="";
  if (_uanchor && _udlh && _udlh!="") s=_udlh+"&";
  s+=_udl.search;
  var x=new Date(_udt.getTime()+(_ucto*1000));
  var dc=_ubd.cookie;
  x=" expires="+x.toGMTString()+";";
  if (_ulink && !_ubl) {
    z=_uUES(_uGC(s,"__utmz=","&"));
    if (z!="-" && z.indexOf(";")==-1) { _ubd.cookie="__utmz="+z+"; path="+_utcp+";"+x+_udo; return ""; }
  }
  z=dc.indexOf("__utmz="+_udh);
  if (z>-1) { z=_uGC(dc,"__utmz="+_udh,";"); }
  else { z="-"; }
  t=_uGC(s,_ucid+"=","&");
  t2=_uGC(s,_ucsr+"=","&");
  t3=_uGC(s,"gclid=","&");
  if ((t!="-" && t!="") || (t2!="-" && t2!="") || (t3!="-" && t3!="")) {
    if (t!="-" && t!="") c+="utmcid="+_uEC(t);
    if (t2!="-" && t2!="") { if (c != "") c+="|"; c+="utmcsr="+_uEC(t2); }
    if (t3!="-" && t3!="") { if (c != "") c+="|"; c+="utmgclid="+_uEC(t3); }
    t=_uGC(s,_uccn+"=","&");
    if (t!="-" && t!="") c+="|utmccn="+_uEC(t);
    else c+="|utmccn=(not+set)";
    t=_uGC(s,_ucmd+"=","&");
    if (t!="-" && t!="") c+="|utmcmd="+_uEC(t);
    else  c+="|utmcmd=(not+set)";
    t=_uGC(s,_uctr+"=","&");
    if (t!="-" && t!="") c+="|utmctr="+_uEC(t);
    else { t=_uOrg(1); if (t!="-" && t!="") c+="|utmctr="+_uEC(t); }
    t=_uGC(s,_ucct+"=","&");
    if (t!="-" && t!="") c+="|utmcct="+_uEC(t);
    t=_uGC(s,_ucno+"=","&");
    if (t=="1") o=1;
    if (z!="-" && o==1) return "";
  }
  if (c=="-" || c=="") { c=_uOrg(); if (z!="-" && _ufno==1)  return ""; }
  if (c=="-" || c=="") { if (_ufns==1)  c=_uRef(); if (z!="-" && _ufno==1)  return ""; }
  if (c=="-" || c=="") {
    if (z=="-" && _ufns==1) { c="utmccn=(direct)|utmcsr=(direct)|utmcmd=(none)"; }
    if (c=="-" || c=="") return "";
  }
  if (z!="-") {
    i=z.indexOf(".");
    if (i>-1) i=z.indexOf(".",i+1);
    if (i>-1) i=z.indexOf(".",i+1);
    if (i>-1) i=z.indexOf(".",i+1);
    t=z.substring(i+1,z.length);
    if (t.toLowerCase()==c.toLowerCase()) cs=1;
    t=z.substring(0,i);
    if ((i=t.lastIndexOf(".")) > -1) {
      t=t.substring(i+1,t.length);
      cn=(t*1);
    }
  }
  if (cs==0 || _ufns==1) {
    t=_uGC(dc,"__utma="+_udh,";");
    if ((i=t.lastIndexOf(".")) > 9) {
      _uns=t.substring(i+1,t.length);
      _uns=(_uns*1);
    }
    cn++;
    if (_uns==0) _uns=1;
    _ubd.cookie="__utmz="+_udh+"."+_ust+"."+_uns+"."+cn+"."+c+"; path="+_utcp+"; "+x+_udo;
  }
  if (cs==0 || _ufns==1) return "&utmcn=1";
  else return "&utmcr=1";
}
function _uRef() {
  if (_ur=="0" || _ur=="" || _ur=="-") return "";
  var i=0,h,k,n;
  if ((i=_ur.indexOf("://"))<0) return "";
  h=_ur.substring(i+3,_ur.length);
  if (h.indexOf("/") > -1) {
    k=h.substring(h.indexOf("/"),h.length);
    if (k.indexOf("?") > -1) k=k.substring(0,k.indexOf("?"));
    h=h.substring(0,h.indexOf("/"));
  }
  h=h.toLowerCase();
  n=h;
  if ((i=n.indexOf(":")) > -1) n=n.substring(0,i);
  for (var ii=0;ii<_uRno.length;ii++) {
    if ((i=n.indexOf(_uRno[ii].toLowerCase())) > -1 && n.length==(i+_uRno[ii].length)) { _ufno=1; break; }
  }
  if (h.indexOf("www.")==0) h=h.substring(4,h.length);
  return "utmccn=(referral)|utmcsr="+_uEC(h)+"|"+"utmcct="+_uEC(k)+"|utmcmd=referral";
}
function _uOrg(t) {
  if (_ur=="0" || _ur=="" || _ur=="-") return "";
  var i=0,h,k;
  if ((i=_ur.indexOf("://")) < 0) return "";
  h=_ur.substring(i+3,_ur.length);
  if (h.indexOf("/") > -1) {
    h=h.substring(0,h.indexOf("/"));
  }
  for (var ii=0;ii<_uOsr.length;ii++) {
    if (h.toLowerCase().indexOf(_uOsr[ii].toLowerCase()) > -1) {
      if ((i=_ur.indexOf("?"+_uOkw[ii]+"=")) > -1 || (i=_ur.indexOf("&"+_uOkw[ii]+"=")) > -1) {
        k=_ur.substring(i+_uOkw[ii].length+2,_ur.length);
        if ((i=k.indexOf("&")) > -1) k=k.substring(0,i);
        for (var yy=0;yy<_uOno.length;yy++) {
          if (_uOno[yy].toLowerCase()==k.toLowerCase()) { _ufno=1; break; }
        }
        if (t) return _uEC(k);
        else return "utmccn=(organic)|utmcsr="+_uEC(_uOsr[ii])+"|"+"utmctr="+_uEC(k)+"|utmcmd=organic";
      }
    }
  }
  return "";
}
function _uBInfo() {
  var sr="-",sc="-",ul="-",fl="-",cs="-",je=1;
  var n=navigator;
  if (self.screen) {
    sr=screen.width+"x"+screen.height;
    sc=screen.colorDepth+"-bit";
  } else if (self.java) {
    var j=java.awt.Toolkit.getDefaultToolkit();
    var s=j.getScreenSize();
    sr=s.width+"x"+s.height;
  }
  if (n.language) { ul=n.language.toLowerCase(); }
  else if (n.browserLanguage) { ul=n.browserLanguage.toLowerCase(); }
  je=n.javaEnabled()?1:0;
  if (_uflash) fl=_uFlash();
  if (_ubd.characterSet) cs=_uES(_ubd.characterSet);
  else if (_ubd.charset) cs=_uES(_ubd.charset);
  return "&utmcs="+cs+"&utmsr="+sr+"&utmsc="+sc+"&utmul="+ul+"&utmje="+je+"&utmfl="+fl;
}
function __utmSetTrans() {
  var e;
  if (_ubd.getElementById) e=_ubd.getElementById("utmtrans");
  else if (_ubd.utmform && _ubd.utmform.utmtrans) e=_ubd.utmform.utmtrans;
  if (!e) return;
  var l=e.value.split("UTM:");
  var i,i2,c;
  if (_userv==0 || _userv==2) i=new Array();
  if (_userv==1 || _userv==2) { i2=new Array(); c=_uGCS(); }
  for (var ii=0;ii<l.length;ii++) {
    l[ii]=_uTrim(l[ii]);
    if (l[ii].charAt(0)!='T' && l[ii].charAt(0)!='I') continue;
    var r=Math.round(Math.random()*2147483647);
    if (!_utsp || _utsp=="") _utsp="|";
    var f=l[ii].split(_utsp),s="";
    if (f[0].charAt(0)=='T') {
      s="&utmt=tran"+"&utmn="+r;
      f[1]=_uTrim(f[1]); if(f[1]&&f[1]!="") s+="&utmtid="+_uES(f[1]);
      f[2]=_uTrim(f[2]); if(f[2]&&f[2]!="") s+="&utmtst="+_uES(f[2]);
      f[3]=_uTrim(f[3]); if(f[3]&&f[3]!="") s+="&utmtto="+_uES(f[3]);
      f[4]=_uTrim(f[4]); if(f[4]&&f[4]!="") s+="&utmttx="+_uES(f[4]);
      f[5]=_uTrim(f[5]); if(f[5]&&f[5]!="") s+="&utmtsp="+_uES(f[5]);
      f[6]=_uTrim(f[6]); if(f[6]&&f[6]!="") s+="&utmtci="+_uES(f[6]);
      f[7]=_uTrim(f[7]); if(f[7]&&f[7]!="") s+="&utmtrg="+_uES(f[7]);
      f[8]=_uTrim(f[8]); if(f[8]&&f[8]!="") s+="&utmtco="+_uES(f[8]);
    } else {
      s="&utmt=item"+"&utmn="+r;
      f[1]=_uTrim(f[1]); if(f[1]&&f[1]!="") s+="&utmtid="+_uES(f[1]);
      f[2]=_uTrim(f[2]); if(f[2]&&f[2]!="") s+="&utmipc="+_uES(f[2]);
      f[3]=_uTrim(f[3]); if(f[3]&&f[3]!="") s+="&utmipn="+_uES(f[3]);
      f[4]=_uTrim(f[4]); if(f[4]&&f[4]!="") s+="&utmiva="+_uES(f[4]);
      f[5]=_uTrim(f[5]); if(f[5]&&f[5]!="") s+="&utmipr="+_uES(f[5]);
      f[6]=_uTrim(f[6]); if(f[6]&&f[6]!="") s+="&utmiqt="+_uES(f[6]);
    }
    if ((_userv==0 || _userv==2) && _uSP()) {
      i[ii]=new Image(1,1);
      i[ii].src=_ugifpath+"?"+"utmwv="+_uwv+s;
      i[ii].onload=function() { _uVoid(); }
    }
    if ((_userv==1 || _userv==2) && _uSP()) {
      i2[ii]=new Image(1,1);
      i2[ii].src=_ugifpath2+"?"+"utmwv="+_uwv+s+"&utmac="+_uacct+"&utmcc="+c;
      i2[ii].onload=function() { _uVoid(); }
    }
  }
  return;
}
function _uFlash() {
  var f="-",n=navigator;
  if (n.plugins && n.plugins.length) {
    for (var ii=0;ii<n.plugins.length;ii++) {
      if (n.plugins[ii].name.indexOf('Shockwave Flash')!=-1) {
        f=n.plugins[ii].description.split('Shockwave Flash ')[1];
        break;
      }
    }
  } else if (window.ActiveXObject) {
    for (var ii=10;ii>=2;ii--) {
      try {
        var fl=eval("new ActiveXObject('ShockwaveFlash.ShockwaveFlash."+ii+"');");
        if (fl) { f=ii + '.0'; break; }
      }
      catch(e) {}
    }
  }
  return f;
}
function __utmLinker(l,h) {
  if (!_ulink) return;
  var p,k,a="-",b="-",c="-",x="-",z="-",v="-";
  var dc=_ubd.cookie;
  if (!l || l=="") return;
  var iq = l.indexOf("?");
  var ih = l.indexOf("#");
  if (dc) {
    a=_uES(_uGC(dc,"__utma="+_udh,";"));
    b=_uES(_uGC(dc,"__utmb="+_udh,";"));
    c=_uES(_uGC(dc,"__utmc="+_udh,";"));
    x=_uES(_uGC(dc,"__utmx="+_udh,";"));
    z=_uES(_uGC(dc,"__utmz="+_udh,";"));
    v=_uES(_uGC(dc,"__utmv="+_udh,";"));
    k=(_uHash(a+b+c+x+z+v)*1)+(_udh*1);
    p="__utma="+a+"&__utmb="+b+"&__utmc="+c+"&__utmx="+x+"&__utmz="+z+"&__utmv="+v+"&__utmk="+k;
  }
  if (p) {
    if (h && ih>-1) return;
    if (h) { _udl.href=l+"#"+p; }
    else {
      if (iq==-1 && ih==-1) _udl.href=l+"?"+p;
      else if (ih==-1) _udl.href=l+"&"+p;
      else if (iq==-1) _udl.href=l.substring(0,ih-1)+"?"+p+l.substring(ih);
      else _udl.href=l.substring(0,ih-1)+"&"+p+l.substring(ih);
    }
  } else { _udl.href=l; }
}
function __utmLinkPost(f,h) {
  if (!_ulink) return;
  var p,k,a="-",b="-",c="-",x="-",z="-",v="-";
  var dc=_ubd.cookie;
  if (!f || !f.action) return;
  var iq = f.action.indexOf("?");
  var ih = f.action.indexOf("#");
  if (dc) {
    a=_uES(_uGC(dc,"__utma="+_udh,";"));
    b=_uES(_uGC(dc,"__utmb="+_udh,";"));
    c=_uES(_uGC(dc,"__utmc="+_udh,";"));
    x=_uES(_uGC(dc,"__utmx="+_udh,";"));
    z=_uES(_uGC(dc,"__utmz="+_udh,";"));
    v=_uES(_uGC(dc,"__utmv="+_udh,";"));
    k=(_uHash(a+b+c+x+z+v)*1)+(_udh*1);
    p="__utma="+a+"&__utmb="+b+"&__utmc="+c+"&__utmx="+x+"&__utmz="+z+"&__utmv="+v+"&__utmk="+k;
  }
  if (p) {
    if (h && ih>-1) return;
    if (h) { f.action+="#"+p; }
    else {
      if (iq==-1 && ih==-1) f.action+="?"+p;
      else if (ih==-1) f.action+="&"+p;
      else if (iq==-1) f.action=f.action.substring(0,ih-1)+"?"+p+f.action.substring(ih);
      else f.action=f.action.substring(0,ih-1)+"&"+p+f.action.substring(ih);
    }
  }
  return;
}
function __utmSetVar(v) {
  if (!v || v=="") return;
  if (!_udo || _udo == "") {
    _udh=_uDomain();
    if (_udn && _udn!="") { _udo=" domain="+_udn+";"; }
  }
  if (!_uVG()) return;
  var r=Math.round(Math.random() * 2147483647);
  _ubd.cookie="__utmv="+_udh+"."+_uES(v)+"; path="+_utcp+"; expires="+_uNx()+";"+_udo;
  var s="&utmt=var&utmn="+r;
  if ((_userv==0 || _userv==2) && _uSP()) {
    var i=new Image(1,1);
    i.src=_ugifpath+"?"+"utmwv="+_uwv+s;
    i.onload=function() { _uVoid(); }
  }
  if ((_userv==1 || _userv==2) && _uSP()) {
    var i2=new Image(1,1);
    i2.src=_ugifpath2+"?"+"utmwv="+_uwv+s+"&utmac="+_uacct+"&utmcc="+_uGCS();
    i2.onload=function() { _uVoid(); }
  }
}
function _uGCS() {
  var t,c="",dc=_ubd.cookie;
  if ((t=_uGC(dc,"__utma="+_udh,";"))!="-") c+=_uES("__utma="+t+";+");
  if ((t=_uGC(dc,"__utmb="+_udh,";"))!="-") c+=_uES("__utmb="+t+";+");
  if ((t=_uGC(dc,"__utmc="+_udh,";"))!="-") c+=_uES("__utmc="+t+";+");
  if ((t=_uGC(dc,"__utmx="+_udh,";"))!="-") c+=_uES("__utmx="+t+";+");
  if ((t=_uGC(dc,"__utmz="+_udh,";"))!="-") c+=_uES("__utmz="+t+";+");
  if ((t=_uGC(dc,"__utmv="+_udh,";"))!="-") c+=_uES("__utmv="+t+";");
  if (c.charAt(c.length-1)=="+") c=c.substring(0,c.length-1);
  return c;
}
function _uGC(l,n,s) {
  if (!l || l=="" || !n || n=="" || !s || s=="") return "-";
  var i,i2,i3,c="-";
  i=l.indexOf(n);
  i3=n.indexOf("=")+1;
  if (i > -1) {
    i2=l.indexOf(s,i); if (i2 < 0) { i2=l.length; }
    c=l.substring((i+i3),i2);
  }
  return c;
}
function _uDomain() {
  if (!_udn || _udn=="" || _udn=="none") { _udn=""; return 1; }
  if (_udn=="auto") {
    var d=_ubd.domain;
    if (d.substring(0,4)=="www.") {
      d=d.substring(4,d.length);
    }
    _udn=d;
  }
  _udn = _udn.toLowerCase();
  if (_uhash=="off") return 1;
  return _uHash(_udn);
}
function _uHash(d) {
  if (!d || d=="") return 1;
  var h=0,g=0;
  for (var i=d.length-1;i>=0;i--) {
    var c=parseInt(d.charCodeAt(i));
    h=((h << 6) & 0xfffffff) + c + (c << 14);
    if ((g=h & 0xfe00000)!=0) h=(h ^ (g >> 21));
  }
  return h;
}
function _uFixA(c,s,t) {
  if (!c || c=="" || !s || s=="" || !t || t=="") return "-";
  var a=_uGC(c,"__utma="+_udh,s);
  var lt=0,i=0;
  if ((i=a.lastIndexOf(".")) > 9) {
    _uns=a.substring(i+1,a.length);
    _uns=(_uns*1)+1;
    a=a.substring(0,i);
    if ((i=a.lastIndexOf(".")) > 7) {
      lt=a.substring(i+1,a.length);
      a=a.substring(0,i);
    }
    if ((i=a.lastIndexOf(".")) > 5) {
      a=a.substring(0,i);
    }
    a+="."+lt+"."+t+"."+_uns;
  }
  return a;
}
function _uTrim(s) {
  if (!s || s=="") return "";
  while ((s.charAt(0)==' ') || (s.charAt(0)=='\n') || (s.charAt(0,1)=='\r')) s=s.substring(1,s.length);
  while ((s.charAt(s.length-1)==' ') || (s.charAt(s.length-1)=='\n') || (s.charAt(s.length-1)=='\r')) s=s.substring(0,s.length-1);
  return s;
}
function _uEC(s) {
  var n="";
  if (!s || s=="") return "";
  for (var i=0;i<s.length;i++) {if (s.charAt(i)==" ") n+="+"; else n+=s.charAt(i);}
  return n;
}
function __utmVisitorCode(f) {
  var r=0,t=0,i=0,i2=0,m=31;
  var a=_uGC(_ubd.cookie,"__utma="+_udh,";");
  if ((i=a.indexOf(".",0))<0) return;
  if ((i2=a.indexOf(".",i+1))>0) r=a.substring(i+1,i2); else return "";
  if ((i=a.indexOf(".",i2+1))>0) t=a.substring(i2+1,i); else return "";
  if (f) {
    return r;
  } else {
    var c=new Array('A','B','C','D','E','F','G','H','J','K','L','M','N','P','R','S','T','U','V','W','X','Y','Z','1','2','3','4','5','6','7','8','9');
    return c[r>>28&m]+c[r>>23&m]+c[r>>18&m]+c[r>>13&m]+"-"+c[r>>8&m]+c[r>>3&m]+c[((r&7)<<2)+(t>>30&3)]+c[t>>25&m]+c[t>>20&m]+"-"+c[t>>15&m]+c[t>>10&m]+c[t>>5&m]+c[t&m];
  }
}
function _uIN(n) {
  if (!n) return false;
  for (var i=0;i<n.length;i++) {
    var c=n.charAt(i);
    if ((c<"0" || c>"9") && (c!=".")) return false;
  }
  return true;
}
function _uES(s,u) {
  if (typeof(encodeURIComponent) == 'function') {
    if (u) return encodeURI(s);
    else return encodeURIComponent(s);
  } else {
    return escape(s);
  }
}
function _uUES(s) {
  if (typeof(decodeURIComponent) == 'function') {
    return decodeURIComponent(s);
  } else {
    return unescape(s);
  }
}
function _uVG() {
  if((_udn.indexOf("www.google.") == 0 || _udn.indexOf(".google.") == 0 || _udn.indexOf("google.") == 0) && _utcp=='/' && _udn.indexOf("google.org")==-1) {
    return false;
  }
  return true;
}
function _uSP() {
  var s=100;
  if (_usample) s=_usample;
  if(s>=100 || s<=0) return true;
  return ((__utmVisitorCode(1)%10000)<(s*100));
}
function urchinPathCopy(p){
  var d=document,nx,tx,sx,i,c,cs,t,h,o;
  cs=new Array("a","b","c","v","x","z");
  h=_uDomain(); if (_udn && _udn!="") o=" domain="+_udn+";";
  nx=_uNx()+";";
  tx=new Date(); tx.setTime(tx.getTime()+(_utimeout*1000));
  tx=tx.toGMTString()+";";
  sx=new Date(); sx.setTime(sx.getTime()+(_ucto*1000));
  sx=sx.toGMTString()+";";
  for (i=0;i<6;i++){
    t=" expires=";
    if (i==1) t+=tx; else if (i==2) t=""; else if (i==5) t+=sx; else t+=nx;
    c=_uGC(d.cookie,"__utm"+cs[i]+"="+h,";");
    if (c!="-") d.cookie="__utm"+cs[i]+"="+c+"; path="+p+";"+t+o;
  }
}
function _uCO() {
  if (!_utk || _utk=="" || _utk.length<10) return;
  var d='www.google.com';
  if (_utk.charAt(0)=='!') d='analytics.corp.google.com';
  _ubd.cookie="GASO="+_utk+"; path="+_utcp+";"+_udo;
  var sc=document.createElement('script');
  sc.type='text/javascript';
  sc.id="_gasojs";
  sc.src='https://'+d+'/analytics/reporting/overlay_js?gaso='+_utk+'&'+Math.random();
  document.getElementsByTagName('head')[0].appendChild(sc);
}
function _uGT() {
  var h=location.hash, a;
  if (h && h!="" && h.indexOf("#gaso=")==0) {
    a=_uGC(h,"gaso=","&");
  } else {
    a=_uGC(_ubd.cookie,"GASO=",";");
  }
  return a;
}
//var _utk=_uGT();
/*if (_utk && _utk!="" && _utk.length>10) {
  if (window.addEventListener) {
    window.addEventListener('load', _uCO, false);
  } else if (window.attachEvent) {
    window.attachEvent('onload', _uCO);
  }
}*/
function _uNx() {
  return (new Date((new Date()).getTime()+63072000000)).toGMTString();
}

/*
 Style HTML
 ---------------

 Written by Nochum Sossonko, (nsossonko@hotmail.com)
 $Date: 2008-06-12 23:50:45 +0300 (Thu, 12 Jun 2008) $
 $Revision: 62 $

 Based on code initially developed by: Einars "elfz" Lielmanis, <elfz@laacz.lv>
 http://elfz.laacz.lv/beautify/

 You are free to use this in any way you want, in case you find this useful or working for you.
 Usage:
 style_html(html_source);
 */
function style_html(html_source, indent_size, indent_character, max_char) {
//Wrapper function to invoke all the necessary constructors and deal with the output.

  var Parser, multi_parser;

  function Parser() {

    this.pos = 0; //Parser position
    this.token = '';
    this.current_mode = 'CONTENT'; //reflects the current Parser mode: TAG/CONTENT
    this.tags = { //An object to hold tags, their position, and their parent-tags, initiated with default values
      parent: 'parent1',
      parentcount: 1,
      parent1: ''
    };
    this.tag_type = '';
    this.token_text = this.last_token = this.last_text = this.token_type = '';

    this.Utils = { //Uilities made available to the various functions
      whitespace: "\n\r\t ".split(''),
      single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed'.split(','), //all the single tags for HTML
      extra_liners: 'head,body,/html'.split(','), //for tags that need a line of whitespace before them
      in_array: function (what, arr) {
        for (var i=0; i<arr.length; i++) {
          if (what === arr[i]) {
            return true;
          }
        }
        return false;
      }
    }

    this.get_content = function () { //function to capture regular content between tags

      var char = '';
      var content = [];
      var space = false; //if a space is needed
      while (this.input.charAt(this.pos) !== '<') {
        if (this.pos >= this.input.length) {
          return content.length?content.join(''):['', 'TK_EOF'];
        }

        char = this.input.charAt(this.pos);
        this.pos++;
        this.line_char_count++;


        if (this.Utils.in_array(char, this.Utils.whitespace)) {
          if (content.length) {
            space = true;
          }
          this.line_char_count--;
          continue; //don't want to insert unnecessary space
        }
        else if (space) {
          if (this.line_char_count >= this.max_char) { //insert a line when the max_char is reached
            content.push('\n');
            for (var i=0; i<this.indent_level; i++) {
              content.push(this.indent_string);
            }
            this.line_char_count = 0;
          }
          else{
            content.push(' ');
            this.line_char_count++;
          }
          space = false;
        }
        content.push(char); //letter at-a-time (or string) inserted to an array
      }
      return content.length?content.join(''):'';
    }

    this.get_script = function () { //get the full content of a script to pass to js_beautify

      var char = '';
      var content = [];
      var reg_match = new RegExp('\<\/script' + '\>', 'igm');
      reg_match.lastIndex = this.pos;
      var reg_array = reg_match.exec(this.input);
      var end_script = reg_array?reg_array.index:this.input.length; //absolute end of script
      while(this.pos < end_script) { //get everything in between the script tags
        if (this.pos >= this.input.length) {
          return content.length?content.join(''):['', 'TK_EOF'];
        }

        char = this.input.charAt(this.pos);
        this.pos++;


        content.push(char);
      }
      return content.length?content.join(''):''; //we might not have any content at all
    }

    this.record_tag = function (tag){ //function to record a tag and its parent in this.tags Object
      if (this.tags[tag + 'count']) { //check for the existence of this tag type
        this.tags[tag + 'count']++;
        this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
      }
      else { //otherwise initialize this tag type
        this.tags[tag + 'count'] = 1;
        this.tags[tag + this.tags[tag + 'count']] = this.indent_level; //and record the present indent level
      }
      this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent; //set the parent (i.e. in the case of a div this.tags.div1parent)
      this.tags.parent = tag + this.tags[tag + 'count']; //and make this the current parent (i.e. in the case of a div 'div1')
    }

    this.retrieve_tag = function (tag) { //function to retrieve the opening tag to the corresponding closer
      if (this.tags[tag + 'count']) { //if the openener is not in the Object we ignore it
        var temp_parent = this.tags.parent; //check to see if it's a closable tag.
        while (temp_parent) { //till we reach '' (the initial value);
          if (tag + this.tags[tag + 'count'] === temp_parent) { //if this is it use it
            break;
          }
          temp_parent = this.tags[temp_parent + 'parent']; //otherwise keep on climbing up the DOM Tree
        }
        if (temp_parent) { //if we caught something
          this.indent_level = this.tags[tag + this.tags[tag + 'count']]; //set the indent_level accordingly
          this.tags.parent = this.tags[temp_parent + 'parent']; //and set the current parent
        }
        delete this.tags[tag + this.tags[tag + 'count'] + 'parent']; //delete the closed tags parent reference...
        delete this.tags[tag + this.tags[tag + 'count']]; //...and the tag itself
        if (this.tags[tag + 'count'] == 1) {
          delete this.tags[tag + 'count'];
        }
        else {
          this.tags[tag + 'count']--;
        }
      }
    }

    this.get_tag = function () { //function to get a full tag and parse its type
      var char = '';
      var content = [];
      var space = false;
      do {
        if (this.pos >= this.input.length) {
          return content.length?content.join(''):['', 'TK_EOF'];
        }

        char = this.input.charAt(this.pos);
        this.pos++;
        this.line_char_count++;

        if (this.Utils.in_array(char, this.Utils.whitespace)) { //don't want to insert unnecessary space
          space = true;
          this.line_char_count--;
          continue;
        }

        if (char === "'" || char === '"') {
          if (!content[1] || content[1] !== '!') { //if we're in a comment strings don't get treated specially
            char += this.get_unformatted(char);
            space = true;
          }
        }

        if (char === '=') { //no space before =
          space = false;
        }

        if (content.length && content[content.length-1] !== '=' && char !== '>'
          && space) { //no space after = or before >
          if (this.line_char_count >= this.max_char) {
            this.print_newline(false, content);
            this.line_char_count = 0;
          }
          else {
            content.push(' ');
            this.line_char_count++;
          }
          space = false;
        }
        content.push(char); //inserts character at-a-time (or string)
      } while (char !== '>');

      var tag_complete = content.join('');
      var tag_index;
      if (tag_complete.indexOf(' ') != -1) { //if there's whitespace, thats where the tag name ends
        tag_index = tag_complete.indexOf(' ');
      }
      else { //otherwise go with the tag ending
        tag_index = tag_complete.indexOf('>');
      }
      var tag_check = tag_complete.substring(1, tag_index).toLowerCase();
      if (tag_complete.charAt(tag_complete.length-2) === '/' ||
        this.Utils.in_array(tag_check, this.Utils.single_token)) { //if this tag name is a single tag type (either in the list or has a closing /)
        this.tag_type = 'SINGLE';
      }
      else if (tag_check === 'script') { //for later script handling
        this.record_tag(tag_check);
        this.tag_type = 'SCRIPT';
      }
      else if (tag_check === 'style') { //for future style handling (for now it justs uses get_content)
        this.record_tag(tag_check);
        this.tag_type = 'STYLE';
      }
      else if (tag_check.charAt(0) === '!') { //peek for <!-- comment
        if (tag_check.indexOf('[if') != -1) { //peek for <!--[if conditional comment
          if (tag_complete.indexOf('!IE') != -1) { //this type needs a closing --> so...
            var comment = this.get_unformatted('-->', tag_complete); //...delegate to get_unformatted
            content.push(comment);
          }
          this.tag_type = 'START';
        }
        else if (tag_check.indexOf('[endif') != -1) {//peek for <!--[endif end conditional comment
          this.tag_type = 'END';
          this.unindent();
        }
        else if (tag_check.indexOf('[cdata[') != -1) { //if it's a <[cdata[ comment...
          var comment = this.get_unformatted(']]>', tag_complete); //...delegate to get_unformatted function
          content.push(comment);
          this.tag_type = 'SINGLE'; //<![CDATA[ comments are treated like single tags
        }
        else {
          var comment = this.get_unformatted('-->', tag_complete);
          content.push(comment);
          this.tag_type = 'SINGLE';
        }
      }
      else {
        if (tag_check.charAt(0) === '/') { //this tag is a double tag so check for tag-ending
          this.retrieve_tag(tag_check.substring(1)); //remove it and all ancestors
          this.tag_type = 'END';
        }
        else { //otherwise it's a start-tag
          this.record_tag(tag_check); //push it on the tag stack
          this.tag_type = 'START';
        }
        if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) { //check if this double needs an extra line
          this.print_newline(true, this.output);
        }
      }
      return content.join(''); //returns fully formatted tag
    }

    this.get_unformatted = function (delimiter, orig_tag) { //function to return unformatted content in its entirety

      if (orig_tag && orig_tag.indexOf(delimiter) != -1) {
        return '';
      }
      var char = '';
      var content = '';
      var space = true;
      do {


        char = this.input.charAt(this.pos);
        this.pos++

        if (this.Utils.in_array(char, this.Utils.whitespace)) {
          if (!space) {
            this.line_char_count--;
            continue;
          }
          if (char === '\n' || char === '\r') {
            content += '\n';
            for (var i=0; i<this.indent_level; i++) {
              content += this.indent_string;
            }
            space = false; //...and make sure other indentation is erased
            this.line_char_count = 0;
            continue;
          }
        }
        content += char;
        this.line_char_count++;
        space = true;


      } while (content.indexOf(delimiter) == -1);
      return content;
    }

    this.get_token = function () { //initial handler for token-retrieval
      var token;

      if (this.last_token === 'TK_TAG_SCRIPT') { //check if we need to format javascript
        var temp_token = this.get_script();
        if (typeof temp_token !== 'string') {
          return temp_token;
        }
        token = js_beautify(temp_token, this.indent_size, this.indent_character, this.indent_level); //call the JS Beautifier
        return [token, 'TK_CONTENT'];
      }
      if (this.current_mode === 'CONTENT') {
        token = this.get_content();
        if (typeof token !== 'string') {
          return token;
        }
        else {
          return [token, 'TK_CONTENT'];
        }
      }

      if(this.current_mode === 'TAG') {
        token = this.get_tag();
        if (typeof token !== 'string') {
          return token;
        }
        else {
          var tag_name_type = 'TK_TAG_' + this.tag_type;
          return [token, tag_name_type];
        }
      }
    }

    this.printer = function (js_source, indent_character, indent_size, max_char) { //handles input/output and some other printing functions

      this.input = js_source || ''; //gets the input for the Parser
      this.output = [];
      this.indent_character = indent_character || ' ';
      this.indent_string = '';
      this.indent_size = indent_size || 2;
      this.indent_level = 0;
      this.max_char = max_char || 70; //maximum amount of characters per line
      this.line_char_count = 0; //count to see if max_char was exceeded

      for (var i=0; i<this.indent_size; i++) {
        this.indent_string += this.indent_character;
      }

      this.print_newline = function (ignore, arr) {
        this.line_char_count = 0;
        if (!arr || !arr.length) {
          return;
        }
        if (!ignore) { //we might want the extra line
          while (this.Utils.in_array(arr[arr.length-1], this.Utils.whitespace)) {
            arr.pop();
          }
        }
        arr.push('\n');
        for (var i=0; i<this.indent_level; i++) {
          arr.push(this.indent_string);
        }
      }


      this.print_token = function (text) {
        this.output.push(text);
      }

      this.indent = function () {
        this.indent_level++;
      }

      this.unindent = function () {
        if (this.indent_level > 0) {
          this.indent_level--;
        }
      }
    }
    return this;
  }

  /*_____________________--------------------_____________________*/



  multi_parser = new Parser(); //wrapping functions Parser
  multi_parser.printer(html_source, indent_character, indent_size); //initialize starting values



  while (true) {
    var t = multi_parser.get_token();
    multi_parser.token_text = t[0];
    multi_parser.token_type = t[1];

    if (multi_parser.token_type === 'TK_EOF') {
      break;
    }

    switch (multi_parser.token_type) {
      case 'TK_TAG_START': case 'TK_TAG_SCRIPT': case 'TK_TAG_STYLE':
      multi_parser.print_newline(false, multi_parser.output);
      multi_parser.print_token(multi_parser.token_text);
      multi_parser.indent();
      multi_parser.current_mode = 'CONTENT';
      break;
      case 'TK_TAG_END':
        multi_parser.print_newline(true, multi_parser.output);
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.current_mode = 'CONTENT';
        break;
      case 'TK_TAG_SINGLE':
        multi_parser.print_newline(false, multi_parser.output);
        multi_parser.print_token(multi_parser.token_text);
        multi_parser.current_mode = 'CONTENT';
        break;
      case 'TK_CONTENT':
        if (multi_parser.token_text !== '') {
          multi_parser.print_newline(false, multi_parser.output);
          multi_parser.print_token(multi_parser.token_text);
        }
        multi_parser.current_mode = 'TAG';
        break;
    }
    multi_parser.last_token = multi_parser.token_type;
    multi_parser.last_text = multi_parser.token_text;
  }
  return multi_parser.output.join('');
}


module.exports.js_beautify = js_beautify;
