const escpos = require('..');
const assert = require('assert');

describe('Arduino serial test', function() {

  it('device#write', function(done){
    var device = new escpos.Console((data) => {
      console.log(data);
      assert.equal(data.length, 3);
      done();
    });
    device.write(Buffer.alloc(3));
  })

  it('arduino#write', function(done){
    var device = new escpos.Console((data) => {
      assert.deepEqual(data, Buffer.from('hello world'));
      done();
    });
    var arduino = new escpos.Arduino(device);
    arduino.print('hello world').flush();
  })

  it('arduino#serial write', function(done){
    const device = new escpos.Serial('COM18');
    const arduino = new escpos.Arduino(device);

    device.open(err => {
      if (err) {
        console.error(err);
        assert.fail();
      }

      console.log('port opened');
      arduino.print('hello helele\n');
      arduino.close();
      done();
    })
  })
});
