class Model {
  #id;
  #idCollection;

  constructor() {
    this.#idCollection = [];
    this.#id = 0;
  }

  deleteContact(id) {
    try {
      fetch('/api/contacts/' + id, {
        method: 'DELETE',
      })
    } catch(err) {
      console.log(err)
    }
  }

  addTag(tagName) {
    let obj = {};
    this.#id += 1;
    obj.id = String(this.#id);

    if (this.isUniqueTag(tagName)) { 
      obj.value = tagName;
      this.#idCollection.push(obj)
    } 
  }

  isUniqueTag(tagName) {
    return this.#idCollection.map(tag => tag.value).indexOf(tagName) === -1
  }

  getAllTags() {
    return this.#idCollection;
  }

  deleteTag(id) {
    this.#idCollection = this.#idCollection.filter(tag => tag.id !== id)
  }

  async allContacts() {
    let contacts = await fetch('/api/contacts').then((res) => res.json());
    return contacts;
  }

  async addContact(jsonObj) {
    let data = await fetch('/api/contacts/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: jsonObj
    }).then((res) => res.json())

    console.log(data)
  }

  getTagObjects(tags) {
    let tagColl = tags.split(',');

    return this.#idCollection.filter(tag => {
      if (tagColl.indexOf(tag.value) !== -1) {
        return tag;
      }
    })
  }

  async getContact(id) {
    let contact = await fetch('/api/contacts/' + id).then((res) => res.json());
    return contact;
  }

  async updateContact(contact, id) {
    let update = await fetch('/api/contacts/' + id, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: contact,
    }).then((res) => res.json())

    console.log(update)
  }

  async filteredContactsByName(str) {
    let contacts = await this.allContacts();
    let matches = [];

    contacts.forEach(contact => {
      if (contact.full_name.toLowerCase().indexOf(str.toLowerCase()) !== -1) {
        matches.push(contact)
      }
    })

    return matches;
  }
}

class View {
  constructor() {
    this.templates = this.compileTemplates();
    this.tagManager = document.querySelector('.tags-container');
    this.contactsContainer = document.querySelector('.contacts-container');
    this.addTagBtn = document.querySelector('.add-tag');
    this.tagForm = document.querySelector('#tag-form');
    this.tagManagerTagList = document.querySelector('#tag-manager-list');
    this.emptyPlaceholder = document.querySelector('.empty-contacts-placeholder');
    this.addContactBtn = document.querySelector('.add-contact');
    this.mainForm = document.querySelector('#main-form');
    this.formContainer = document.querySelector('.form-container');
    this.formAllContacts = document.querySelector('ul.contact-tags-list');
    this.chosenTags = document.querySelector('ul.chosen-tags');
  }

  compileTemplates() {
    let temps = {};

    document.querySelectorAll("script[type='x/text-handlebars']").forEach(script => {
      temps[script.id] = Handlebars.compile(script.innerHTML);
    })

    Handlebars.registerPartial('mainTags', document.querySelector('#main-tag').innerHTML);

    return temps;
  }

  displayTagManager(e) {
    e.preventDefault();
    this.displayElement(this.tagManager);
    this.hideMainPage();
    this.hideClearBtn()
  }

  hideTagManager(e) {
    this.hideElement(this.tagManager);
    this.showMainPage()
  }

  hideMainPage() {
    document.querySelector('.row').classList.add('hidden');
    document.querySelector('.empty-contacts-placeholder').classList.add('hidden');
    document.querySelector('.contacts-container').classList.add('hidden');
  }

  displayElement(el) {
    el.classList.remove('hidden');
  }

  hideElement(el) {
    el.classList.add('hidden')
  }

  renderTagManagerTags(tags) {
    this.tagManagerTagList.innerHTML = '';
    this.tagManagerTagList.insertAdjacentHTML('beforeend', this.templates['list-tag']({listTags: tags}));
    this.resetForm(this.tagForm)
  }

  resetForm(form) {
    form.reset()
  }

  showMainPage() {
    document.querySelector('.row').classList.remove('hidden');
    document.querySelector('.empty-contacts-placeholder').classList.remove('hidden');
    document.querySelector('.contacts-container').classList.remove('hidden');
    this.formContainer.classList.add('hidden');
  }

  toggleEmptyPlaceholder(contacts) {
    if (contacts.length > 0) {
      this.emptyPlaceholder.classList.add('hidden')
    } else {
      this.emptyPlaceholder.classList.remove('hidden')
    }
  }

  renderAllContacts(contacts, currentTags) {
    this.contactsContainer.innerHTML = '';

    contacts.forEach(contact => {
      let tagStr;
      if (contact.tags) {
        tagStr = contact.tags;
        contact.tags = this.getTagObjects(contact.tags, currentTags);
      }
      
      this.contactsContainer.insertAdjacentHTML('beforeend', this.templates['contacts'](contact));
      contact.tags = tagStr
    })
  }

  renderFormTags(currentTags) {
    this.formAllContacts.innerHTML = '';
    this.formAllContacts.insertAdjacentHTML('beforeend', this.templates['form-tags']({contactTags: currentTags}))
  }

  renderFormChosenTags(tags) {
    this.chosenTags.insertAdjacentHTML('beforeend', this.templates['list-tag']({listTags: tags}))
  }

  displayTag(id) {
    [...this.formAllContacts.querySelectorAll('button')].forEach(btn => {
      if (btn.dataset.id === id) { 
        this.displayElement(btn) 
      }
    })
  }

  getTagObjects(tags, currentTags) {
    let tagColl = tags.split(',');

    return currentTags.filter(tag => {
      if (tagColl.indexOf(tag.value) !== -1) {
        return tag;
      }
    })
  }

  addFormHeader(text) {
    document.querySelector('.page-header').textContent = text;
  }

  removeElement(el) {
    el.remove()
  }

  renderErrorMessage(input, message) {
    let small = input.nextElementSibling;
    small.textContent = message;
  }

  resetChosenTags() {
    this.chosenTags.innerHTML = ''
  }

  populateInputs(contact) {
    console.log(contact);
    [...this.mainForm.querySelectorAll('input')].forEach(input => {
      let type = input.dataset.input
      if (type === 'name') { input.value = contact.full_name }
      if (type === 'email') { input.value = contact.email };
      if (type === 'phone') { input.value = contact.phone_number }
    })
  }

  hideFormChosenTags() {
    console.log(this.chosenTags.querySelectorAll('button'))
    if (this.chosenTags.querySelector('button')) {
      let tagIDs = [...this.chosenTags.querySelectorAll('button')].map(btn => btn.dataset.id);
      console.log(tagIDs);
      [...this.formAllContacts.querySelectorAll('button')].forEach(btn => {
        if (tagIDs.indexOf(btn.dataset.id) !== -1) {
          this.hideElement(btn)
        }
      })
    }
  }

  displayClearBtn() {
    document.querySelector('.clear').classList.remove('hidden');
  }

  hideClearBtn() {
   document.querySelector('.clear').classList.add('hidden');
  }

  toggleNoMatchingContacts(matches) {
    if (matches.length > 0) {
      document.querySelector('.no-matches').classList.add('hidden')
    } else if (matches.length === 0) {
      document.querySelector('.no-matches').classList.remove('hidden')
    }    
  }

  clearErrorMessage(input) {
    let small = input.nextElementSibling;
    small.textContent = ''
  }

  bindAddTagBtn() {
    this.addTagBtn.addEventListener('click', this.displayTagManager.bind(this));
  }

  bindTagManager(handler) {
    this.tagManager.addEventListener('click', handler)
  }

  bindAddContactBtn(handler) {
    this.addContactBtn.addEventListener('click', handler)
  }

  bindForm(handler) {
    this.mainForm.addEventListener('click', handler);
  }

  bindContactContainer(handler) {
    this.contactsContainer.addEventListener('click', handler);
  }

  bindClearBtn(handler) {
    document.querySelector('.clear').addEventListener('click', handler)
  }

  bindSearchInput(handler) {
    document.querySelector('.contact-name-search').addEventListener('input', handler)
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.displayAllContacts();
    this.bindEvents()
  }

  async displayAllContacts() {
    let contacts = await this.getAllContacts();
    this.addMissingTags(contacts)
    this.view.toggleEmptyPlaceholder(contacts);
    if (contacts.length > 0) { this.view.toggleNoMatchingContacts(contacts) }
    this.view.renderAllContacts(contacts, this.model.getAllTags());
  }

  addMissingTags(contacts) {
    contacts.forEach(contact => {
      if (contact.tags) {
        contact.tags.split(',').forEach(tag => {
          let currentTagArr = this.model.getAllTags().map(tag => tag.value);
          if (currentTagArr.indexOf(tag) === -1) {
            this.model.addTag(tag);
            this.view.renderTagManagerTags(this.model.getAllTags())
          }
        })
      }
    })
  }

  bindEvents() {
    this.view.bindAddTagBtn();
    this.view.bindTagManager(this.handleTagManager.bind(this));
    this.view.bindAddContactBtn(this.setAddContactForm.bind(this));
    this.view.bindForm(this.handleForm.bind(this));
    this.view.bindContactContainer(this.handleContactContainer.bind(this));
    this.view.bindClearBtn(this.handleClear.bind(this));
    this.view.bindSearchInput(this.handleSearch.bind(this))
  }

  handleContactContainer(e) {
    e.preventDefault();
    let target = e.target;

    if (this.isEditButton(target)) {
      if (target.tagName !== 'A') { target = target.closest('A')}
      this.setEditForm(target)
    }

    if (this.isDeleteButton(target)) {
      if (target.tagName !== 'A') { target = target.closest('A')}
      this.model.deleteContact(target.dataset.id);
      this.displayAllContacts()
    }

    if (target.classList.contains('tag-value')) {
      let tagValue = target.textContent.trim();
      this.filterContactByTag(tagValue);
    }
  }

  async filterContactByTag(tagValue) {
    let contacts = await this.getAllContacts();
    let matches = [];

    contacts.forEach(contact => {
      if (contact.tags) {
        if (contact.tags.split(',').indexOf(tagValue) !== -1) {
          matches.push(contact);
          this.view.displayClearBtn()
        }
      }
    })

    this.view.renderAllContacts(matches, this.model.getAllTags())
  }

  handleForm(e) {
    e.preventDefault();
    let target = e.target;
    
    if (target.className === 'tag-button') {
      let id = target.dataset.id;
      this.view.hideElement(target);
      let match = this.model.getAllTags().filter(tag => tag.id === id);
      this.view.renderFormChosenTags(match);
    }

    if (target.id === 'tag-close') {
      let id = target.closest('button').dataset.id;
      this.view.displayTag(id)
      this.view.removeElement(target.closest('button'));
    }

    if (target.id === 'sub-contact') {
      if (this.view.mainForm.dataset.type === 'contact-form') { this.processContact() }
      if (this.view.mainForm.dataset.type === 'edit-form') { this.processUpdate() }
      this.view.hideClearBtn()
    }

    if (target.id === 'cancel') {
      this.view.showMainPage();
      this.displayAllContacts();
      this.view.hideClearBtn()
    }
  }

  getJSONObject() {
    let obj = {};
    [...this.view.mainForm.querySelectorAll('input')].forEach(input => {
      let type = input.dataset.input;
      if (type === 'name') { obj.full_name = input.value }
      if (type === 'email') { obj.email = input.value }
      if (type === 'phone') {
        if (input.value.length === 0) {
          obj.phone_number = ' ';
        } else {
          obj.phone_number = input.value;
        }
      }
    })

    if (this.view.chosenTags.querySelector('button')) {
      let tags = [...this.view.chosenTags.querySelectorAll('button')].map(btn => btn.querySelector('.tag-value').textContent.trim());
      obj.tags = tags.join(',')
    } else if (!this.view.chosenTags.querySelector('button')) {
      obj.tags = null;
    }

    return JSON.stringify(obj)
  }

  processContact() {
    if (this.validInputs()) {
      this.model.addContact(this.getJSONObject());
      this.displayAllContacts();
      this.view.showMainPage()
    }

    if (!this.validInputs()) {
      this.processInputErrorMessages();
    }
  }

  processUpdate() {
    if (this.validInputs()) {
      this.model.updateContact(this.getJSONObject(), this.id);
      this.displayAllContacts()
      this.view.showMainPage()
      this.displayAllContacts();
      console.log(this.getJSONObject())
    }

    if (!this.validInputs()) {
      this.processInputErrorMessages()
    }
  }

  clearAnyErrorMessages() {
    this.view.mainForm.querySelectorAll('input').forEach(input => {
      this.view.clearErrorMessage(input)
    })    
  }

  processInputErrorMessages() {
    this.view.mainForm.querySelectorAll('input').forEach(input => {
      if (!input.checkValidity()) {
        if (input.dataset.input === 'name') {
          this.view.renderErrorMessage(input, 'Please enter valid name.')
        } else if (input.dataset.input === 'email') {
          this.view.renderErrorMessage(input, 'Please enter valid email.')
        }
      }
    })
  }

  validInputs() {
    return [...this.view.mainForm.querySelectorAll('input')].every(inp => inp.checkValidity())
  }

  async handleTagManager(e) {
    e.preventDefault();
    let target = e.target;

    if (target.tagName === 'BUTTON' && target.id === 'submit') {
      let input = this.view.tagForm.querySelector('#tag-input').value;
      this.model.addTag(input);
      this.view.renderTagManagerTags(this.model.getAllTags());
    }

    if (target.id === 'tag-close') {
      let id = target.closest('button').dataset.id
      await this.deleteFromAllContacts(id)
      this.model.deleteTag(id);
      this.view.renderTagManagerTags(this.model.getAllTags())
    }

    if (target.id === 'done') {
      this.view.hideTagManager();
      this.displayAllContacts()
    }
  }

  async deleteFromAllContacts(id) {
    let contacts = await this.getAllContacts();
    let tagValue = this.model.getAllTags().filter(tag => tag.id === id)[0].value;

    contacts.forEach(contact => {
      if (contact.tags) {
        let arr = contact.tags.split(',');
        arr = arr.filter(tag => tag !== tagValue);
        contact.tags = arr.join(',')
      }

      this.model.updateContact(JSON.stringify(contact), contact.id);
    })
  }

  setAddContactForm(e) {
    e.preventDefault();
    this.clearAnyErrorMessages();
    this.view.mainForm.dataset.type = 'contact-form';
    this.view.addFormHeader('Add Contact')
    this.view.renderFormTags(this.model.getAllTags());
    this.view.displayElement(this.view.formContainer);
    this.view.hideMainPage();
    this.view.resetChosenTags();
    this.view.resetForm(this.view.mainForm);
    this.view.hideClearBtn()
  }

  async setEditForm(target) {
    this.id = target.dataset.id;
    this.clearAnyErrorMessages()
    let contact = await this.model.getContact(this.id);
    this.view.resetForm(this.view.mainForm);
    this.view.populateInputs(contact);
    this.view.mainForm.dataset.type = 'edit-form';
    this.view.addFormHeader('Edit Contact');
    this.view.resetChosenTags();
    if (contact.tags) { this.view.renderFormChosenTags(this.model.getTagObjects(contact.tags)) };
    this.view.hideMainPage();
    this.view.displayElement(this.view.formContainer);
    this.view.renderFormTags(this.model.getAllTags());
    this.view.hideFormChosenTags();
    this.view.hideClearBtn()
  }

  isEditButton(target) {
    return (target.classList.contains('edit-contact')) || 
           (target.parentNode.tagName === 'A' &&
            target.parentNode.classList.contains('edit-contact'))
  }

  isDeleteButton(target) {
    return (target.classList.contains('delete-contact')) || 
           (target.parentNode.tagName === 'A' &&
            target.parentNode.classList.contains('delete-contact'))    
  }

  handleClear(e) {
    e.preventDefault();
    this.displayAllContacts()
    this.view.hideClearBtn()
  }

  async handleSearch(e) {
    let target = e.target;
    let matches;

    if (target.value.length === 0) {
      this.displayAllContacts();
    } else if (target.value.length > 0) {
      let matches = await this.model.filteredContactsByName(target.value);
      if (matches.length > 1) { matches = await this.sortByIndexProperty(JSON.parse(JSON.stringify(matches)), target.value)};
      this.view.toggleNoMatchingContacts(matches)
      this.view.renderAllContacts(matches, this.model.getAllTags())
    }
  }

  async sortByIndexProperty(matches, subStr) {
    matches = await matches;
    let sorted;

    sorted = matches.map(contact => {
      contact.index = contact.full_name.indexOf(subStr);
      return contact;
    }).sort((a,b) => {
      let ind1 = a.index
      let ind2 = b.index

      if (ind1 < ind2) {
        return -1;
      }

      if (ind1 > ind2) {
        return 1;
      }

      return 0;
    })

    return sorted;
  }

  async getAllContacts() {
    let contacts = await this.model.allContacts();
    return contacts;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Controller(new Model(), new View())
})