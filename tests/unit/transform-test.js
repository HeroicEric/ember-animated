import { module, test } from 'qunit';
import { equalTransform } from '../helpers/assertions';
import {
  ownTransform,
  cumulativeTransform,
  Transform
} from 'ember-animated/transform';
import $ from 'jquery';

let environment, myParent, target;
const WIDTH = 601;
const HEIGHT = 402;

module("Unit | Transform", {
  beforeEach(assert) {
    assert.equalTransform = equalTransform;

    let fixture = $('#qunit-fixture');
    fixture.html('<div class="environment"><div class="myParent"><div class="target"></div></div></div>');
    environment = fixture.find('.environment');
    myParent = fixture.find('.myParent');
    target = fixture.find('.target');
    environment.width(WIDTH);
    target.height(HEIGHT);
  },
  afterEach() {
    $('#qunit-fixture').empty();
  }
});

test('Degenerate case', function(assert) {
  assert.equalTransform(cumulativeTransform(target), new Transform(1, 0, 0, 1, 0, 0));
});

test('Scale x', function(assert) {
  target.css('transform', 'scaleX(0.5)');
  assert.equalTransform(cumulativeTransform(target), new Transform(0.5, 0, 0, 1, WIDTH * (1 - 0.5) / 2, 0));
});

test('Scale x (origin top left)', function(assert) {
  target.css('transform', 'scaleX(0.5)');
  target.css('transform-origin', '0px 0px');
  assert.equalTransform(cumulativeTransform(target), new Transform(0.5, 0, 0, 1, 0, 0));
});

test('Scale y', function(assert) {
  target.css('transform', 'scaleY(2.5)');
  assert.equalTransform(cumulativeTransform(target), new Transform(1, 0, 0, 2.5, 0, HEIGHT * (1 - 2.5) / 2));
});

test('Scale both', function(assert) {
  target.css('transform', 'scale(1.2)');
  assert.equalTransform(cumulativeTransform(target), new Transform(1.2, 0, 0, 1.2, WIDTH * (1 - 1.2) / 2, HEIGHT * (1 - 1.2)/ 2));
});

test('Scale both nonuniform', function(assert) {
  target.css('transform', 'scaleX(2.5) scaleY(0.7)');
  assert.equalTransform(cumulativeTransform(target), new Transform(2.5, 0, 0, 0.7, WIDTH * (1 - 2.5) / 2, HEIGHT * (1 - 0.7)/ 2));
});

test('Translation', function(assert) {
  target.css('transform', 'translateX(123px) translateY(456px)');
  assert.equalTransform(cumulativeTransform(target), new Transform(1, 0, 0, 1, 123, 456));
});

test('Scale then translate', function(assert) {
  target.css('transform', 'scaleX(0.5) scaleY(0.7) translateX(123px) translateY(456px)');
  assert.equalTransform(cumulativeTransform(target), new Transform(0.5, 0, 0, 0.7, WIDTH * (1 - 0.5)/2 + 123*0.5, HEIGHT * (1 - 0.7)/2 + 456*0.7));
});

test('Translate then scale', function(assert) {
  target.css('transform', 'translateX(123px) translateY(456px) scaleX(0.5) scaleY(0.7)');
  assert.equalTransform(cumulativeTransform(target), new Transform(0.5, 0, 0, 0.7, WIDTH * (1 - 0.5)/2 + 123, HEIGHT * (1 - 0.7)/2 + 456));
});

test('Scale then translate (origin top left)', function(assert) {
  target.css('transform', 'scaleX(0.5) scaleY(0.7) translateX(123px) translateY(456px)');
  target.css('transform-origin', '0px 0px');
  assert.equalTransform(cumulativeTransform(target), new Transform(0.5, 0, 0, 0.7, 123*0.5, 456*0.7));
});

test('Translate then scale (origin top left)', function(assert) {
  target.css('transform', 'translateX(123px) translateY(456px) scaleX(0.5) scaleY(0.7)');
  target.css('transform-origin', '0px 0px');
  assert.equalTransform(cumulativeTransform(target), new Transform(0.5, 0, 0, 0.7, 123, 456));
});

test('Stacked transforms', function(assert) {
  myParent.css('transform', 'translateX(-50px) translateY(-20px)');
  target.css('transform', 'translateX(123px) translateY(456px)');
  target.css('transform-origin', '0px 0px');
  assert.equalTransform(cumulativeTransform(target), new Transform(1, 0, 0, 1, 123-50, 456-20));
});

test('Stacked transforms (origin top left)', function(assert) {
  myParent.css('transform', 'translateX(-50px) translateY(-20px)');
  myParent.css('transform-origin', '0px 0px');
  target.css('transform', 'translateX(123px) translateY(456px)');
  target.css('transform-origin', '0px 0px');
  assert.equalTransform(cumulativeTransform(target), new Transform(1, 0, 0, 1, 123-50, 456-20));
});

test('Rotate on center of element', function(assert) {
  let s = Math.sin(30 * Math.PI / 180);
  let c = Math.cos(30 * Math.PI / 180);
  target.css('transform', 'rotate(30deg)');
  assert.equalTransform(ownTransform(target), new Transform(c, s, -s, c, WIDTH*(1 - c)/2 + HEIGHT*s/2, -WIDTH*s/2 + HEIGHT*(1-c)/2));
});

test('Rotate and translate', function(assert) {
  let s = Math.sin(45 * Math.PI / 180);
  let c = Math.cos(45 * Math.PI / 180);
  target.css('transform', 'translateX(123px) rotate(45deg)');
  assert.equalTransform(ownTransform(target), new Transform(c, s, -s, c, WIDTH*(1 - c)/2 + HEIGHT*s/2 + 123, -WIDTH*s/2 + HEIGHT*(1-c)/2));
});


test('Rotate and translate (origin top left)', function(assert) {
  let s = Math.sin(45 * Math.PI / 180);
  target.css('transform', 'translateX(123px) rotate(45deg)');
  target.css('transform-origin', '0px 0px');
  assert.equalTransform(ownTransform(target), new Transform(s, s, -s, s, 123, 0));
});

[
  'translateX(100px) translateY(200px)',
  'rotate(30deg)',
  'scale(0.5)',
  'scaleX(0.5) scaleY(0.7)',
  'scaleX(0.5) translateX(300px)',
  'translateX(300px) scaleX(0.5)',
  'rotate(10deg) translateX(300px) scaleX(0.5)'
].forEach(function(transform){
  test(`Adjusts transform-origin correctly for ${transform}, relative to top left`, function(assert) {
    target.css('transform', transform);
    target.css('transform-origin', '0px 0px');
    let withTopLeftOrigin = ownTransform(target);

    target.css('transform', `translateX(-50%) translateY(-50%) ${transform} translateX(50%) translateY(50%)`);
    target.css('transform-origin', '50% 50%');
    let withDefaultOrigin = ownTransform(target);

    assert.equalTransform(withDefaultOrigin, withTopLeftOrigin);
  });

  test(`Adjusts transform-origin correctly for ${transform}, relative to center`, function(assert) {
    target.css('transform', transform);
    target.css('transform-origin', '50% 50%');
    let withDefaultOrigin = ownTransform(target);

    target.css('transform', `translateX(50%) translateY(50%) ${transform} translateX(-50%) translateY(-50%)`);
    target.css('transform-origin', '0px 0px');
    let withTopLeftOrigin = ownTransform(target);

    assert.equalTransform(withTopLeftOrigin, withDefaultOrigin);
  });

});
