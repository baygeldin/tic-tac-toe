/* eslint-env mocha */

// This file contains tests of the main component's visual interface
// and its interaction with server's API (through a mock).

import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import { shallow , mount, render} from 'enzyme'
import sinon from 'sinon'
import React from 'react'
import Board from 'components/board'
import Main from 'components/main'

// Chai configuration.
chai.use(chaiEnzyme())
const expect = chai.expect

describe('client', () => {
  it('renders board inside <Main />', () => {
    let wrapper = mount(<Main />)
    expect(wrapper).to.containMatchingElement(<Board />)
  })
})
