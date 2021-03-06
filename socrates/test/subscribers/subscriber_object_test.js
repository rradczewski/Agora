'use strict';

const expect = require('must-dist');

const beans = require('../../testutil/configureForTest').get('beans');
const Subscriber = beans.get('subscriber');
const currentYear = beans.get('socratesConstants').currentYear;

describe('Subscriber', () => {
  let unregisteredSubscriber;
  let unregisteredSubscriberWhoParticipatedLastYear;
  let registeredSubscriber;

  beforeEach(() => {
    const registered = {};
    registered[currentYear] = {};
    unregisteredSubscriber = new Subscriber({id: 'unregistered'});
    unregisteredSubscriberWhoParticipatedLastYear = new Subscriber({id: 'unregistered', participations: {}});
    registeredSubscriber = new Subscriber({id: 'unregistered', participations: registered});
  });

  it('isParticipating', () => {
    expect(unregisteredSubscriber.isParticipating()).to.be.false();
    expect(unregisteredSubscriberWhoParticipatedLastYear.isParticipating()).to.be.false();
    expect(registeredSubscriber.isParticipating()).to.be.true();
  });

  describe('does NOT fill from UI', () => {
    it('the subscriber id', () => {
      unregisteredSubscriber.fillFromUI({id: 'ID'});
      expect(unregisteredSubscriber.id()).to.be('unregistered');
    });

    it('the addon if no home address provided', () => {
      /* eslint no-underscore-dangle: 0 */

      unregisteredSubscriber.fillFromUI({});
      expect(unregisteredSubscriber.state._addon).to.be.undefined();
      expect(unregisteredSubscriber.addon().homeAddress()).to.be.undefined();
    });

    it('the participation if no participation information hint is given', () => {
      unregisteredSubscriber.fillFromUI({roommate: 'My best friend'});
      expect(unregisteredSubscriber.state.participation).to.be.undefined();
      expect(unregisteredSubscriber.currentParticipation().roommate()).to.be.undefined();
    });
  });

  describe('does fill from UI', () => {
    it('the addon if some home address provided', () => {
      unregisteredSubscriber.fillFromUI({homeAddress: 'bingo'});
      expect(unregisteredSubscriber.addon().homeAddress()).to.be('bingo');
    });

    it('the participation if a participation information hint is provided', () => {
      unregisteredSubscriber.fillFromUI({hasParticipationInformation: true});
      expect(unregisteredSubscriber.currentParticipation().roommate()).to.be('');
    });
  });

  describe('gives participation information by year (if available)', () => {
    it('for the year 2010', () => {
      unregisteredSubscriber.fillFromUI({hasParticipationInformation: true, roommate: 'My sister'});
      unregisteredSubscriber.state.participations['2010'] = unregisteredSubscriber.state.participations[currentYear];
      delete unregisteredSubscriber.state.participations[currentYear];
      expect(unregisteredSubscriber.participationOf('2010').roommate()).to.be('My sister');
    });
  });

  describe('evaluates diversity status', () => {
    it('does not consider anyone living in Germany to be diversity by default', () => {
      registeredSubscriber.state.country = 'DE';
      registeredSubscriber.addon().state.tShirtSize = '';
      registeredSubscriber.addon().state.pronoun = '';
      expect(registeredSubscriber.isDiversity()).to.be.false();
    });

    it('considers living outside of Germany an indicator for diversity', () => {
      registeredSubscriber.state.country = 'US';
      registeredSubscriber.addon().state.tShirtSize = '';
      registeredSubscriber.addon().state.pronoun = '';
      expect(registeredSubscriber.isDiversity()).to.be.true();
    });

    it('considers ladies t-shirts an indicator for diversity', () => {
      registeredSubscriber.state.country = 'DE';
      registeredSubscriber.addon().state.tShirtSize = 'Ladies';
      registeredSubscriber.addon().state.pronoun = '';
      expect(registeredSubscriber.isDiversity()).to.be.true();
    });

    it('does not consider a pronoun an indicator for diversity', () => {
      registeredSubscriber.state.country = 'DE';
      registeredSubscriber.addon().state.tShirtSize = '';
      registeredSubscriber.addon().state.pronoun = 'Something';
      expect(registeredSubscriber.isDiversity()).to.be.false();
    });

    it('automatically admits foreign applicants as diversity', () => {
      registeredSubscriber.state.country = 'US';
      registeredSubscriber.addon().state.tShirtSize = '';
      registeredSubscriber.addon().state.pronoun = '';
      expect(registeredSubscriber.diversityAdmissionStatus()).to.equal('yes');
    });

    it('advises checking of applicants with custom pronouns', () => {
      registeredSubscriber.state.country = 'DE';
      registeredSubscriber.addon().state.tShirtSize = '';
      registeredSubscriber.addon().state.pronoun = 'Something';
      expect(registeredSubscriber.diversityAdmissionStatus()).to.equal('check');
    });
  });
});
