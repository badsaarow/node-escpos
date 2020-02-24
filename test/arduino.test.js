const escpos = require('..');
const assert = require('assert');

describe('Arduino serial test', function() {

  it('device#write', function(done){
    var device = new escpos.Console(function(data){
      assert.equal(data.length, 3);
      done();
    });
    device.write(Buffer.alloc(3));
  })

  it('arduino#write', function(done){
    var device = new escpos.Console(function(data){
      assert.deepEqual(data, Buffer.from('hello world'));
      done();
    });
    var arduino = new escpos.Arduino(device);
    arduino.print('hello world').flush();
  })
});
