var packager = require('../lib/packager'),
    sjcl = require('sjcl'),
    test = require('tape');


test('read package', function(t){
  var dir = 'tests/assets/story1';
  t.plan(1);

  var json = packager.load_package_json(dir);
  t.equal(json.name, "Sample story 1");
});


test('read start chapter', function(t){
  var dir = 'tests/assets/story1';
  t.plan(1);

  var pkg = packager.load_package_json(dir);
  var chapter = packager.load_start_chaper(pkg);
  t.equal('chapter1', chapter.name)
})

test('create graph', function(t){
  var dir = 'tests/assets/story1';
  t.plan(17);

  var pkg = packager.load_package_json(dir);
  var graph = packager.generate_graph(dir, pkg);


  t.ok(graph.nodes.chapter1.id);
  //t.ok(graph.nodes.chapter1);
  t.ok(graph.nodes.chapter2.id);
  t.ok(graph.nodes.chapter2.key);
  t.ok(graph.nodes.chapter2a.id);
  t.ok(graph.nodes.chapter2a.key);
  t.ok(graph.nodes.chapter3.id);
  t.ok(graph.nodes.chapter3.key);
  t.ok(graph.nodes.chapter4.id);
  t.ok(graph.nodes.chapter4.key);
  t.ok(graph.nodes.chapter5.id);
  t.ok(graph.nodes.chapter5.key);

  //t.equal(graph.keys['_|chapter1'].pass, '343jk43943jn43');
  t.equal(graph.keys['chapter1|chapter2'].pass, '343jk43943jn43');
  t.equal(graph.keys['chapter1|chapter2a'].pass, 'doug');
  t.equal(graph.keys['chapter2|chapter3'].pass, 'abba-acca');
  t.equal(graph.keys['chapter2a|chapter3'].pass, 'edm-1952-43484394389');
  t.equal(graph.keys['chapter3|chapter4'].pass, 'post-29329023-3923');
  t.equal(graph.keys['chapter4|chapter5'].pass, '221-2121-1212');
})





