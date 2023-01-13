let Model = {
  init() {

  },
};

let View = {
  bindDisplayTagManager(handler) {
    this.manageTagBtn.addEventListener('click', handler);
  },

  bindPromptClickEvent(handler) {
    this.confirmPrompt.addEventListener('click', handler);
  },

  bindContactsClickEvent(handler) {
    this.contactsContainer.addEventListener('click', handler)
  },

  bindAddContactEvent(handler) {
    this.addContactBtn.addEventListener('click', handler)
  },

  bindTagManagerSubmit(handler) {
    this.tagsContainer.addEventListener('click', handler)
  },

  bindMainFormEvent(handler) {
    this.mainForm.addEventListener('click', handler);
  },

  bindEditFormClickEvent(handler) {
    this.editFormContainer.addEventListener('click', handler)
  },

  bindSearchContactInputEvent(handler) {
    this.nameSearch.addEventListener('input', handler)
  },

  hideTopRow() {
    this.topContainer.classList.add('hidden');
    this.emptyContactsPlaceHolder.classList.add('hidden');    
  },

  displayContactForm() {
    this.formContainer.classList.remove('hidden');
    this.formHeader.textContent = 'Create Contact';
    this.hideTopRow()
  },

  displayEditForm() {
    this.editFormContainer.classList.remove('hidden')
    this.topContainer.classList.add('hidden')
  },

  hideContactForm() {
    this.formContainer.classList.add('hidden');
    this.displayTopRow()
  },

  displayTagManager() {
    this.hideTopRow();
    this.tagsContainer.classList.remove('hidden')
  },

  displayTopRow() {
    this.topContainer.classList.remove('hidden');
    this.emptyContactsPlaceHolder.classList.remove('hidden');    
  },

  hideEditForm() {
    this.editFormContainer.classList.add('hidden');
    this.displayTopRow()
  },

  getTemplates() {
    let temps = {};
    [...document.querySelectorAll("script[data-name='template']")].forEach(script => {
      temps[script['id']] = Handlebars.compile(script.innerHTML)
    });

    Handlebars.registerPartial('listTag', document.querySelector('#main-tag').innerHTML)
    
    return temps;
  },

  closeTagManagerWindow() {
    this.tagsContainer.classList.add('hidden');
    this.displayTopRow()
  },



  init() {
    this.templates = this.getTemplates();
    this.confirmPrompt = document.querySelector('.confirm_prompt')
    this.contactsContainer = document.querySelector('.contacts-container')
    this.addContactBtn = document.querySelector('.add-contact');
    this.manageTagBtn = document.querySelector('.add-tag');
    this.tagsContainer = document.querySelector('.tags-container')
    this.formContainer = document.querySelector('.form-container');
    this.editFormContainer = document.querySelector('.edit-form-container')
    this.mainForm = document.querySelector('#main-form');
    this.editForm = document.querySelector('#main-edit-form')
    this.formHeader = this.formContainer.querySelector('h2.page-header');
    this.topContainer = document.querySelector('.main-container');
    this.emptyContactsPlaceHolder = document.querySelector('.empty-contacts-placeholder');
    this.nameSearch = document.querySelector('.contact-name-search')
    return this;
  }
};

let Constructor = {
  addContact(e) {
    this.view.displayContactForm();
    if (document.querySelector('#tag-manager-list>button')) {
      document.querySelectorAll('.contact-tags-list>button').forEach(btn => {
        btn.classList.remove('hidden')
      })
    }

    this.hideContacts()
  },

  hideContacts() {
    document.querySelector('.contacts-container').classList.add('hidden')
  },

  showContacts() {
   document.querySelector('.contacts-container').classList.remove('hidden');
   if (document.querySelector('.contacts-container>li')) {
    this.hideEmptyContactPH()
   }
  },

  displayTagManager(e) {
    this.view.displayTagManager();
    this.hideEmptyContactPH();
    this.hideContacts()
  },

  handleTagManagerClick(e) {
    e.preventDefault()
    let target = e.target;
    let inputVal = document.querySelector('#tag-input').value.trim();

    let inputObj = {}
    inputObj["value"] = inputVal;

    if (target.id === 'submit') {
      if (inputVal.length > 0) {
        this.id += 1;
        inputObj['id'] = this.id;
        let arr = [inputObj]
        this.tagList.insertAdjacentHTML('beforeend', this.view.templates['list-tag']({listTags: arr}));

        this.addTagsToContactPage(arr)   
      }
    }

    if (target.id === 'tag-close') {
      let id = target.closest('button').dataset.id
      let button = target.closest('button');
      button.remove();
      this.removeFromMainForm(id);
      this.removeFromMainFormChosen(id);
    }

    if (target.id === 'done') {
      this.view.closeTagManagerWindow();
      this.showContacts();
      if (document.querySelector('.contacts-container>li')) {
        this.hideEmptyContactPH()
      }

    }

    document.querySelector('#tag-form').reset()
  },

  removeFromMainFormChosen(id) {
    let chosenTagsBtns = [...document.querySelectorAll('ul.chosen-tags>button')];
    if (chosenTagsBtns) {
      chosenTagsBtns.forEach(tag => {
        if (tag.dataset.id === id) {
          tag.remove()
        }
      })
    }
  },

  removeFromMainForm(id) {
    let contactTagsBtns = [...document.querySelectorAll('ul.contact-tags-list>button')]

    if (contactTagsBtns) {
      contactTagsBtns.forEach(tag => {
        if (tag.dataset.id === id) {
          tag.remove();
        }
      })      
    }
  },

  addTagsToContactPage(arr) {
    this.contactFormTagList.insertAdjacentHTML('beforeend', this.view.templates['contact-tag']({contactTags: arr}))
  },

  handleFormClick(e) {
    let target = e.target;
    let inputObj = {};

    if (target.id === 'cancel') {
      e.preventDefault();
      this.view.hideContactForm();
      this.resetChosenTags();
      this.resetContactsTagList()
      this.view.mainForm.reset();
      this.showContacts()

      if (document.querySelector('ul.contacts-container>li')) {
        this.hideEmptyContactPH()
      }
    }

    if (target.className === 'tag-button') {
      inputObj['value'] = target.textContent.trim();
      inputObj['id'] = target.dataset.id
      let arr = [inputObj]

      document.querySelector('.chosen-tags').insertAdjacentHTML('beforeend', this.view.templates['list-tag']({listTags: arr}));
      this.hideTag(target);
    }

    if (target.id === 'tag-close') {
      let tagID = target.closest('button').dataset.id;
      target.closest('button').remove();
      this.showTag(tagID)
    }

    if (target.id === 'sub-contact') {
      e.preventDefault()
      let contactInfo = this.getFormInputData();

      this.postNewContact(contactInfo);
      this.hideEmptyContactPH()
      this.view.hideContactForm();
      this.resetChosenTags();
      this.view.mainForm.reset();
      this.showContacts()
      this.updateAllContacts(); 
    }
  },

  hideEmptyContactPH() {
    document.querySelector('.empty-contacts-placeholder').classList.add('hidden');
  },

  showEmptyContactPH() {
    document.querySelector('.empty-contacts-placeholder').classList.remove('hidden');
  },

  getFormInputData() {
    let data = {};

    [...this.view.mainForm.querySelectorAll('input')].forEach(inp => {
      if (inp.dataset.input === 'name') {
        data['full_name'] = inp.value
      } else if (inp.dataset.input === 'email') {
        data['email'] = inp.value;
      } else if (inp.dataset.input === 'phone') {
        data['phone_number'] = inp.value
      }
    })
 
    let tagsString = [...document.querySelectorAll('ul.chosen-tags>button')].map(btn => {
        return btn.querySelector('.tag-value').textContent;
    }).join(',');

    if (tagsString) {
      data.tags = tagsString
    }
     
   return data;
  },

  postNewContact(contact) {
    fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact),
    })
  },

  resetContactsTagList() {
    [...document.querySelectorAll('ul.contact-tags-list>button')].forEach(tag => {
      tag.classList.remove('hidden')
    })
  },

  resetChosenTags() {
    let chosenTagsBtns = [...document.querySelectorAll('ul.chosen-tags>button')];

    if (chosenTagsBtns) {
      chosenTagsBtns.forEach(tag => tag.remove())
    }
  },

  showTag(id) {
    [...document.querySelectorAll('ul.contact-tags-list>button')].forEach(tag => {
      if (tag.dataset.id === id) {
        tag.classList.remove('hidden')
      }
    })
  },

  hideTag(el) {
    el.classList.add('hidden');
  },

  updateAllContacts() {
    fetch('/api/contacts')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          document.querySelector('.empty-contacts-placeholder').classList.add('hidden');
        }
        document.querySelector('ul.contacts-container').innerHTML = '';

        data.forEach(contact => {
          if (contact.tags) {
            contact.tags = contact.tags.split(',')
          }

          document.querySelector('ul.contacts-container').insertAdjacentHTML('beforeend', this.view.templates['contact'](contact))
        })
      });
  },

  handleContactClick(e) {
    let target = e.target;

    if (target.classList.contains('delete-contact')) {
      this.toDeleteID = target.dataset.id
      this.displayPrompt();
    }

    if (target.classList.contains('edit-contact')) {
      this.view.displayEditForm();
      document.querySelector('.contacts-container').classList.add('hidden');
      this.editID = target.dataset.id;
      this.renderContact(this.editID); 
    }

    if (target.classList.contains('contact-button') || target === document.querySelector('.tag-value')) {
      if (target.tagName === 'BUTTON') { target = target.querySelector('.tag-value')}
      let text = target.textContent.trim()
      this.filterContacts(text)
    }
  },

  filterContacts(tag) {
    fetch('/api/contacts')
      .then((res) => res.json())
      .then((data) => {
        data.forEach(contact => {
          if (contact.tags.split(',').includes(tag)) {
            document.querySelector('ul.contacts-container').innerHTML = '';
            contact.tags = contact.tags.split(',')
            document.querySelector('ul.contacts-container').insertAdjacentHTML('beforeend', this.view.templates['contact'](contact))
          }
        })
      })
  },

  displayPrompt() {
    document.querySelector('div.overlay').style.display = 'block';
    document.querySelector('div.confirm_prompt').style.display = 'block';
  },

  hidePrompt() {
    document.querySelector('div.overlay').style.display = 'none';
    document.querySelector('div.confirm_prompt').style.display = 'none';
  },

  deleteFromAPI(id) {
    fetch('/api/contacts/' + id, {
      method: 'DELETE',
    })
  },

  handlePromptClick(e) {
    e.preventDefault();

    let target = e.target;

    if (target.className === 'confirm_yes') {
      this.hidePrompt();
      this.deleteFromAPI(this.toDeleteID);
      this.updateAllContacts()
    }

    if (target.className === 'confirm_no') {
      this.hidePrompt();
    }
  },

  handleEditFormClick(e) {
    let target = e.target;
    let inputObj = {};

    if (target.id === 'cancel') {
      e.preventDefault()
      this.view.hideEditForm();
      this.showContacts()
    }

    if (target.id === 'sub-contact') {
      e.preventDefault()
      let contactInfo = this.getEditInputData();

      this.updateAllContacts()
      this.postUpdatedContact(contactInfo);
      this.hideEmptyContactPH()
      this.view.hideEditForm();
      this.view.editForm.reset();
      this.showContacts();
      this.updateAllContacts();     
    }

    if (target.className === 'tag-button') {
      inputObj['value'] = target.textContent.trim();
      inputObj['id'] = target.dataset.id
      let arr = [inputObj]

      document.querySelector('.edit-chosen-tags').insertAdjacentHTML('beforeend', this.view.templates['list-tag']({listTags: arr}));
      this.hideTag(target);
    }

    if (target.id === 'tag-close') {
      let tagID = target.closest('button').dataset.id;
      target.closest('button').remove();
      this.showEditTag(tagID)
    }    
  },

  showEditTag(id) {
    [...document.querySelectorAll('ul.edit-contact-tags-list>button')].forEach(tag => {
      if (tag.dataset.id === id) {
        tag.classList.remove('hidden')
      }
    })
  }, 

  postUpdatedContact(updatedCon) {
    fetch('/api/contacts/' + this.editID, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(updatedCon)
    })
  },

  getEditInputData() {
    let data = {};

    data.id = this.editID;

    [...this.view.editForm.querySelectorAll('input')].forEach(inp => {
      if (inp.dataset.input === 'name') {
        data['full_name'] = inp.value
      } else if (inp.dataset.input === 'email') {
        data['email'] = inp.value;
      } else if (inp.dataset.input === 'phone') {
        data['phone_number'] = inp.value
      }
    })
 
    let tagsString = [...document.querySelectorAll('ul.edit-chosen-tags>button')].map(btn => {
        return btn.querySelector('.tag-value').textContent;
    }).join(',');

    if (tagsString) {
      data.tags = tagsString
    }
     
   return data;    
  },

  renderContact(id) {
    fetch('/api/contacts/' + id)
      .then((res) => res.json())
      .then((contact) => {
        
        document.querySelector('.edit-form-container').querySelectorAll('input').forEach(input => {
          if (input.dataset.input === 'name') {
            input.value = contact['full_name']
          } else if (input.dataset.input === 'email') {
            input.value = contact.email;
          } else if (input.dataset.input === 'phone') {
            input.value = contact['phone_number']
          }
        })

        document.querySelector('.edit-chosen-tags').innerHTML = '';
        
        if (contact.tags) {
          let tagArr = contact.tags.split(',').map(tag => {
            let tagObj = {};
            tagObj.value = tag;
            let tagID = this.getTagID(tag);

            if (tagID) {
              tagObj.id = tagID;
            };

            return tagObj;
          })
          
          document.querySelector('.edit-chosen-tags').insertAdjacentHTML('beforeend', this.view.templates['list-tag']({listTags: tagArr}));
        }

        if (document.querySelector('#tag-manager-list>button')) {
            let tagCollection = this.getCurrentTagsForEdit();
            console.log(tagCollection)
            document.querySelector('.edit-contact-tags-list').innerHTML = ''
            document.querySelector('.edit-contact-tags-list').insertAdjacentHTML('beforeend', this.view.templates['contact-tag']({contactTags: tagCollection}))
            this.formatEditAvailableTags()
        }
      })
  },

  formatEditAvailableTags() {
    let avTags = document.querySelector('.edit-contact-tags-list>button');
    let chosenTags = document.querySelector('.edit-chosen-tags>button');

    chosenTags = !chosenTags ? [] : [...document.querySelectorAll('.edit-chosen-tags>button')].map(btn => btn.querySelector('.tag-value').textContent.trim());

    if (avTags) {
      [...document.querySelectorAll('.edit-contact-tags-list>button')].forEach(avTag => {
        if (chosenTags.includes(avTag.textContent.trim())) {
          avTag.classList.add('hidden')
        }
      })
    }
  },

  getCurrentTagsForEdit() {
    let tagColl = [];
    document.querySelectorAll('#tag-manager-list>button').forEach(btn => {
      let tag = {};
      tag.id = btn.dataset.id;
      tag.value = btn.querySelector('.tag-value').textContent;
      tagColl.push(tag);
    })

    return tagColl;
  },

  getTagID(tagVal) {
    let tagID;

    document.querySelectorAll('#tag-manager-list>button>.tag-value').forEach(tag => {
      if (tag && tag.textContent.trim() === tagVal.trim()) {
        tagID = tag.closest('button').dataset.id;
      }
    })

    return tagID;
  },

  handleInput(e) {
    let input = e.target.value.trim().toLowerCase();
    let namesAndIDs = this.nameReferences();

    if (input.length === 0) {
      this.updateAllContacts()
    } else {
      namesAndIDs.then((data) => {
        let nameMatches = data.filter(contact => contact.name.indexOf(input) !== -1);
        this.updatePageByInput(nameMatches)
      }) 
    }
  },

  updatePageByInput(matches) {
    fetch('/api/contacts/')
      .then((res) => res.json())
      .then((contacts) => {
        document.querySelector('ul.contacts-container').innerHTML = '';
        contacts.forEach(contact => {
          if (matches.map(mtch => mtch.id).includes(contact.id)) {
  

            if (contact.tags) {
              contact.tags = contact.tags.split(',')
            }
            
            document.querySelector('ul.contacts-container').insertAdjacentHTML('beforeend', this.view.templates['contact'](contact));
          }
        })
      });

  },

  async nameReferences() {
    let currentContacts = await fetch('/api/contacts').then((res) => res.json())
                                 
    let contactObjs = [];

    if (currentContacts.length > 0) {
      [...currentContacts].forEach(li => {
        let obj = {};
        obj.id = Number(li.id);
        obj.name = li.full_name.toLowerCase();
        contactObjs.push(obj);
      })
    }
    
    return (contactObjs)
  },

  init(model, view) {
    this.updateAllContacts()
    this.id = 0
    this.model = model;
    this.view = view;
    this.tagList = document.querySelector('#tag-manager-list');
    this.contactFormTagList = document.querySelector('.contact-tags-list');
    this.view.bindAddContactEvent(this.addContact.bind(this));
    this.view.bindDisplayTagManager(this.displayTagManager.bind(this));
    this.view.bindTagManagerSubmit(this.handleTagManagerClick.bind(this));
    this.view.bindMainFormEvent(this.handleFormClick.bind(this));
    this.view.bindContactsClickEvent(this.handleContactClick.bind(this));
    this.view.bindPromptClickEvent(this.handlePromptClick.bind(this));
    this.view.bindEditFormClickEvent(this.handleEditFormClick.bind(this));
    this.view.bindSearchContactInputEvent(this.handleInput.bind(this))
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Constructor.init(Model.init(), View.init())
})