//>>built
define("plot/geometry/SquadCombat",["dojo/_base/declare","../constants","../plotUtils","./AttackArrow"],function(k,e,f,l){return k([l],{constructor:function(a,b){this.type="polygon";this.plotType="squadcombat";this.headHeightFactor=0.18;this.headWidthFactor=0.3;this.neckHeightFactor=0.85;this.neckWidthFactor=0.15;this.tailWidthFactor=0.1;this.setPoints(a)},generate:function(){var a=this.getPointCount();if(!(2>a)){var b=this.getPoints(),c=this.getTailPoints(b),d=this.getArrowHeadPoints(b,c[0],c[1]),
e=d[0],h=d[4],g=this.getArrowBodyPoints(b,e,h,this.tailWidthFactor),a=g.length,b=[c[0]].concat(g.slice(0,a/2));b.push(e);c=[c[1]].concat(g.slice(a/2,a));c.push(h);b=f.getQBSplinePoints(b);c=f.getQBSplinePoints(c);d=b.concat(d,c.reverse());this.rings=d.concat([d[0]])}},getTailPoints:function(a){var b=f.getBaseLength(a)*this.tailWidthFactor,c=f.getThirdPoint(a[1],a[0],e.HALF_PI,b,!1);a=f.getThirdPoint(a[1],a[0],e.HALF_PI,b,!0);return[c,a]}})});
//# sourceMappingURL=SquadCombat.js.map