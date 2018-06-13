describe('Testing event submission flow', function() {

  var EVENT_NAME = 'Test Event'

  it('Visits Submission page and check all fields', function() {
    cy.visit('/submit-event')
    cy.contains('.form-label', 'Event Title')
    cy.contains('.form-label', 'Event Date')
    cy.contains('.form-label', 'Event Time')
    cy.contains('.form-label', 'Event Image')
    cy.contains('.form-label', 'Social Media Image')
    cy.contains('.form-label', 'Select a Venue')
    cy.contains('.form-label', 'Brief Description')
    cy.contains('.form-label', 'Admission Fee')
    cy.contains('.form-label', 'Your Contact Email')
    cy.contains('.form-label', 'Event Website Link')
    cy.contains('.form-label', 'Ticket Link')
    cy.contains('.form-label', 'Facebook Event Link')
    cy.contains('.form-label', 'Eventbrite Link')
   cy.contains('Full Event Description')
  })

  it('Inputs dummy data into event submission form', function(){
    cy.visit('/submit-event')
    cy.get('.event-title input').type(EVENT_NAME)

    cy.get('.event-start-date i').click()
    cy.contains('13').click()       // lucky number ;)

    cy.get('.start-time .hour').type("9")
    cy.get('.start-time .minute').type("00")

    cy.get('.stop-time .hour').type("10")
    cy.get('.stop-time .minute').type("00")

    // selectFile is a custom command; see cypress/support/commands.js
    cy.get('#event-image').selectFile('images/event_sample_image.jpg');

    cy.get('.venue').focus()
    cy.get('.results-container > :first-child').click()

    cy.get('.brief-description input').type("still testing")
    cy.get('.submitter-email input').type("test@te.st")

    cy.get('.submission-btn').click()
    cy.get('.collapsible-content.expanded')
  })

  it('Submitted events not displayed immediately after submission', function() {
    cy.visit('/')
    cy.contains('.card h3', EVENT_NAME).should('not.exist')
  })

  it('Admin user can verify event', function() {
    cy.visitAsUser('/', 'test-admin')
    cy.get('nav .main-nav .menu__activator button').click()
    cy.get('#account-list li').contains('Admin').click()
    cy.location('pathname').should('include', 'admin')
    cy.contains('.admin-table tr:last-child td', EVENT_NAME)
    cy.get('.admin-table tr:last-child button').contains('Edit').click()
    cy.location('pathname').should('include', 'admin-event-edit')
    cy.get('button').contains('Verify').click()
    cy.get('.alert.alert--dismissible').contains('Success! Event verified.')
  })

  it('Event is displayed after verification', function() {
    cy.visit('/')
    cy.contains('.card h3', EVENT_NAME).should('exist')
  })
})
