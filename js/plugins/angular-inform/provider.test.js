describe('angular-inform', function () {


  describe('informProvider', function () {

    // http://stackoverflow.com/questions/14771810/how-to-test-angularjs-custom-provider

    var provider;

    beforeEach(function () {

      angular.module('i.am.so.fake', []).config(function (informProvider) {
        provider = informProvider;
      });

      module('inform', 'i.am.so.fake');

      inject(function () {
      });

    });

    it('should resolve the informProvider', function () {
      expect(provider).not.toBeUndefined();
    });

    it('should return the default options', function () {

      var defaults = provider.defaults();

      expect(defaults).not.toBeUndefined();

    });

    it('should extend the default options', function () {

      expect(provider.defaults().type).not.toBe('pannekoek'); // u nvr knw

      var defaults = provider.defaults({
        type: 'pannekoek'
      });

      expect(defaults.type).toBe('pannekoek');
    });

  });

  describe('informService', function () {

    var service, $timeout;

    beforeEach(function () {
      module('inform');

      //angular.copy(origDefaultOptions, defaultOptions);

      inject(function (inform, _$timeout_) {
        service = inform;
        $timeout = _$timeout_;
      });
    });

    it('should resolve the inform service', function () {
      expect(service).not.toBeUndefined();
    });

    it('should add a message', function () {

      expect(service.messages().length).toBe(0);

      service.add('simple message');

      expect(service.messages().length).toBe(1);
      expect(service.messages()[0].content).toBe('simple message');
    });

    it('should add a message using the provided type', function () {
      service.add('simple message', { type: 'pannekoek' });
      expect(service.messages()[0].type).toBe('pannekoek');
    });

    it('should remove the specified message', function () {
      expect(service.messages().length).toBe(0);
      var msg = service.add('kill me');
      expect(service.messages().length).toBe(1);
      service.remove(msg);
      expect(service.messages().length).toBe(0);
    });

    it('should remove the message after a timeout', function () {

      expect(service.messages().length).toBe(0);
      service.add('timeout me');
      expect(service.messages().length).toBe(1);

      $timeout.flush();

      expect(service.messages().length).toBe(0);

    });

    it('should cancel a pending timeout when removing a msg', function () {

      var msg = service.add('timeout me');
      expect(msg.timeout).toBeDefined();

      service.remove(msg);

      expect(msg.timeout).toBeFalsy();

    });

    it('should clear all messages', function () {

      var c = 5;

      while (c--) {
        service.add('message ' + c);
      }

      service.clear();

      expect(service.messages().length).toBe(0);

    });

    it('should not display duplicate messages', function () {

      var c = 5;

      while (c--) {
        service.add('duplicate message');
      }

      expect(service.messages().length).toBe(1);
    });

    it('should allow duplicate messages of different kinds', function () {

      service.add('duplicate message', { type: 'success' });
      service.add('duplicate message', { type: 'info' });

      expect(service.messages().length).toBe(2);
    });

    it('should return the same msg object for duplicates', function () {

      var msg1 = service.add('duplicate message');
      var msg2 = service.add('duplicate message');

      expect(msg1).toBe(msg2);

    });

    it('should increase occurence count for duplicates', function () {

      var duplicate = service.add('duplicate message');
      service.add('duplicate message');
      service.add('duplicate message');

      expect(duplicate.count).toBe(3);

    });

  });


});
