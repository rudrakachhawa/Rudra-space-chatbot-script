const axios = require('axios');

let data = [
  // {
  //   name: 'Create Contact',
  //   description: 'Create a Contact for feedback',
  //   type: 'action',
  //   triggertype: 'Write',
  //   inputFields: [
  //     'name',
  //     'Unique ID (Email)',
  //     'About',
  //     'Tag',
  //     'Personas',
  //     'Job Role',
  //     'Company',
  //     'Link Name',
  //     'Link URL',
  //     'External ID'
  //   ]
  // }
  {
    name: 'Create Idea',
    description: 'Create a New Idea',
    type: 'action',
    triggertype: 'Write',
    inputFields: [
      'Idea Title',
      'Description',
      'Business Case - Problem',
      'Business Case - Value',
      'Functional Specs',
      'Notes',
      'Products',
      'Personas',
      'Tag',
      'Workflow Status',
      'Link Name',
      'Link URL',
      'External ID'
    ]
  },
  {
    name: 'Update Contact',
    description: 'Update an existing Contact',
    type: 'action',
    triggertype: 'Write',
    inputFields: [
      'Contact',
      'name',
      'Unique ID (Email)',
      'Company',
      'Job Role',
      'Persona',
      'Tag',
      'Link Name',
      'Link URL',
      'External ID',
      'Phone',
      'About'
    ]
  },
  {
    name: 'Update Idea Stage',
    description: 'Update the stage of an idea in ProdPad',
    type: 'action',
    triggertype: 'Write',
    inputFields: [ 'Workflow Stage', 'Idea' ]
  },
  {
    name: 'Find Contact',
    description: 'Find an existing contact',
    type: 'action',
    triggertype: 'Search',
    inputFields: [
      'External ID',
      'Unique ID (Email)',
      'External URL',
      'name',
      'Company',
      'Persona',
      'Tag',
      'Job Role'
    ]
  },
  {
    name: 'Find Idea',
    description: 'Find an an existing idea.',
    type: 'action',
    triggertype: 'Search',
    inputFields: [ 'External ID', 'External URL', 'Tag', 'Workflow Status' ]
  },
  {
    name: 'Find or Create Contact',
    description: 'Find an existing contact',
    type: 'action',
    triggertype: 'Search or write',
    inputFields: [
      'External ID',
      'Unique ID (Email)',
      'External URL',
      'name',
      'Company',
      'Persona',
      'Tag',
      'Job Role',
      'About',
      'Personas',
      'Link Name',
      'Link URL',
      'External ID'
    ]
  },
  {
    name: 'Create Company',
    description: 'Create a company in the feedback module',
    type: 'action',
    triggertype: 'Write',
    inputFields: [
      'name',        'City',
      'Country',     'Size',
      'Value',       'Tag',
      'Link Name',   'Link URL',
      'External ID'
    ]
  },
  {
    name: 'Create Feedback',
    description: 'Create new feedback',
    type: 'action',
    triggertype: 'Write',
    inputFields: [
      'Feedback',      'Contact',
      'Ideas',         'Tag',
      'Personas',      'Products',
      'Link Name',     'Link URL',
      'External ID',   'Contact Name',
      'Contact Email'
    ]
  },
  {
    name: 'Update Company',
    description: 'Update existing company',
    type: 'action',
    triggertype: 'Write',
    inputFields: [
      'Company ID',
      'name',
      'City',
      'Country',
      'Size',
      'Value',
      'Tag',
      'Include Contacts',
      'Link Name',
      'Link URL',
      'External ID'
    ]
  },
  {
    name: 'Update Feedback',
    description: 'Update an existing piece of feedback',
    type: 'action',
    triggertype: 'Write',
    inputFields: [
      'Feedback ID',
      'Feedback',
      'State',
      'External ID',
      'Link Name',
      'Link URL'
    ]
  },
  {
    name: 'Find Company',
    description: 'Find an existing company',
    type: 'action',
    triggertype: 'Search',
    inputFields: [
      'name',
      'External ID',
      'External URL',
      'Tag',
      'Country',
      'Size',
      'Value',
      'City'
    ]
  },
  {
    name: 'Find Feedback',
    description: 'Find a feedback based on external_id or url.',
    type: 'action',
    triggertype: 'Search',
    inputFields: [
      'External URL',
      'External ID',
      'State',
      'Company',
      'Company Size',
      'Company Country',
      'Company Value',
      'Contact',
      'Product',
      'Persona',
      'Job Role',
      'Tag'
    ]
  },
  {
    name: 'Find or Create Company',
    description: 'Find an existing company',
    type: 'action',
    triggertype: 'Search or write',
    inputFields: [
      'name',         'External ID',
      'External URL', 'Tag',
      'Country',      'Size',
      'Value',        'City',
      'Link Name',    'Link URL',
      'External ID'
    ]
  },
  {
    name: 'Find or Create Feedback',
    description: 'Find a feedback based on external_id or url.',
    type: 'action',
    triggertype: 'Search or write',
    inputFields: [
      'External URL',        'External ID',
      'State',               'Company',
      'Company Size',        'Company Country',
      'Company Value',       'Contact',
      'Product',             'Persona',
      'Job Role',            'Tag',
      'name',                'Feedback',
      'Unique ID (Email)',   'About',
      'Products',            'Personas',
      'Source',              'External Link - Name',
      'External Link - URL', 'External Link - ID'
    ]
  }
];

  (async function performHousekeeping() {
    const chunkSize = 10;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      try {
        const response = await axios.post('http://localhost:7070/housekeeping/bulkCreateActionsByAi', {
          actionsList: chunk, 
          pluginId: "row3sul1vgac",
          authId: "rowi9120jxnz",
          pluginName: "prodpad"
        });
        console.log('Housekeeping performed successfully for chunk:', response.data);
      } catch (error) {
        console.error('Error performing housekeeping for chunk:', error);
      }
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before processing the next chunk
    }
  })();
