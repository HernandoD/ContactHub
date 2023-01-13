class Model {
  #uniqueID;

  constructor() {
    this.tags = [];
    this.#uniqueID = 0
  }

  async getContacts() {
    let response = await fetch('/api/contacts/')
    let data = await response.json();
    return data;
  }

  async addNewContact(contact) {
    try {
      await fetch('/api/contacts/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contact)
      });
    } catch (error) {
      console.log(error)
    }
  }

  async deleteContact(id) {
    try {
      fetch('/api/contacts/' + id, {
        method: 'DELETE'
      })
    } catch (error) {
      console.log(error)
    }
  }

  async getContact(id) {
    let response = await fetch('/api/contacts/' + id)
    let data = response.json();
    return data;
  }

  async updateContact(contact) {
    let id = contact.id;

    try {
      await fetch('/api/contacts/' + id, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contact),
      }); 
    } catch (error) {
      console.log(error)
    }
  }

  addTag(tag) {
    this.#uniqueID += 1;
    let tagObj = {};
    tagObj.value = tag;
    tagObj.id = String(this.#uniqueID)

    if (tag.length > 0 && this.tags.map(tag => tag.value).indexOf(tag) === -1) {
      this.tags.push(tagObj)
    }
  }

  deleteTag(id) {
    this.tags = this.tags.filter(tag => tag.id !== id)
  }

  checkValid(form) {
    return [...form.querySelectorAll('input')].every(inp => inp.checkValidity())
  }
  
}

class View {
  constructor() {
    this.createTemplates();
    this.contactsContainer = document.querySelector('ul.contacts-container');
    this.tagsContainer = document.querySelector('.tags-container');
    this.emptyContactsElement = document.querySelector('.empty-contacts-placeholder');
    this.tagForm = document.querySelector('#tag-form');
    this.formContainer = document.querySelector('.form-container');
    this.mainForm = document.querySelector('#main-form');
    this.chosenTagsList = document.querySelector('ul.chosen-tags');
    this.contactPageTagList = document.querySelector('ul.contact-tags-list')
  }

  createTemplates() {
    this.templates = {};

    [...document.querySelectorAll("script[type='x/text-handlebars']")].forEach(script => {
      this.templates[script.id] = Handlebars.compile(script.innerHTML)
    })

    Handlebars.registerPartial('mainTags', document.querySelector('#main-tag').innerHTML);
  }

  hideEmptyContactsPlaceHolder() {
    this.emptyContactsElement.classList.add('hidden')
  }

  showEmptyContactsPlaceholder() {
    this.emptyContactsElement.classList.remove('hidden')
  }

  hideAllContacts() {
    this.contactsContainer.classList.add('hidden')
  }

  showAllContacts() {
    this.contactsContainer.classList.remove('hidden')
  }

  hideTopRow() {
    document.querySelector('.row').classList.add('hidden')
  }

  showTopRow() {
    document.querySelector('.row').classList.remove('hidden')
  }

  hideTagManagerPage() {
    this.tagsContainer.classList.add('hidden');
    this.showTopRow()
    this.showAllContacts()
  }

  displayTagManager(e) {
    e.preventDefault();
    this.hideEmptyContactsPlaceHolder()
    document.querySelector('.tags-container').classList.remove('hidden');
    this.hideAllContacts();
    this.hideTopRow()
  }

  displayAllTags(tags, element) {
    element.innerHTML = ''
    element.insertAdjacentHTML('beforeend', this.templates['list-tag']({listTags: tags}))
    this.resetForm(this.tagForm)
  }

  displayAllTagsLabels(tags, element) {
    element.innerHTML = ''
    element.insertAdjacentHTML('beforeend', this.templates['contact-tag']({contactTags: tags}))   
  }

  displayTagLabel(id) {
    [...this.contactPageTagList.querySelectorAll('button')].forEach(btn => {
      if (btn.dataset.id === id) {
        btn.classList.remove('hidden')
      }
    })
  }

  displayChosenTag(tags, id) {
    let filteredTags = tags.filter(tag => tag.id === id);

    this.chosenTagsList.insertAdjacentHTML('beforeend', this.templates['list-tag']({listTags: filteredTags}));
  }

  removeChosenTag(id) {
    console.log(this.chosenTagsList.querySelectorAll('button'));
    [...this.chosenTagsList.querySelectorAll('button')].forEach(btn => {
      if (btn.dataset.id === id) {
        btn.remove()
      }
    })
  }

  hideNewContactForm() {
    this.formContainer.classList.add('hidden');
    this.showTopRow();
    this.showAllContacts()
  }

  async renderAllContacts(contacts, currentTags) {
    if (contacts.length > 0) { this.hideEmptyContactsPlaceHolder() }

    this.contactsContainer.innerHTML = '';

    contacts.forEach(contact => {
      let tagStr;

      if (contact.tags) {
        tagStr = contact.tags;
        contact.tags = contact.tags.split(',');
        contact.tags = this.getMatchingTags(contact.tags, currentTags)
      }

      this.contactsContainer.insertAdjacentHTML('beforeend', this.templates['contact'](contact))
      contact.tags = tagStr;
    }) 
  }

  getMatchingTags(contactTags, allTags) {
    let matches = [];

    contactTags.forEach(tag => {
      allTags.forEach(currentTag => {
        if (currentTag.value === tag) {
          matches.push(currentTag)
        }
      })
    })

    return matches;
  }

  markInvalidInputs() {
    [...this.mainForm.querySelectorAll('input')].forEach(inp => {
      if (!inp.checkValidity()) {
        if (inp.dataset.input === 'name') {
          inp.nextElementSibling.textContent = 'Please enter a name.'
        }

        if (inp.dataset.input === 'email') {
          inp.nextElementSibling.textContent = 'Please enter a valid email.'
        }

      }
    })
  }

  showDeletePrompt() {
    document.querySelector('div.overlay').style.display = 'block';
    document.querySelector('div.confirm_prompt').style.display = 'block';
  }

  hideDeletePrompt() {
    document.querySelector('div.overlay').style.display = 'none';
    document.querySelector('div.confirm_prompt').style.display = 'none';    
  }

  renderEditContactInfo(contact, currentTags) {
    [...this.mainForm.querySelectorAll('input')].forEach(inp => {
      let dataSet = inp.dataset.input;

      if (dataSet === 'name') {
        inp.value = contact.full_name;
      } else if (dataSet === 'phone') {
        inp.value = contact.phone_number
      } else if (dataSet === 'email') {
        inp.value = contact.email
      }
    })
    
    if (contact.tags) {
      let arr = contact.tags.split(',');
      arr = this.getMatchingTags(arr, currentTags);

      this.chosenTagsList.insertAdjacentHTML('beforeend', this.templates['list-tag']({listTags: arr}));
    }
  }

  displayAvailableTags() {
    let chosenTags = this.chosenTagsList.querySelector('button');

    if (chosenTags && this.contactPageTagList.querySelector('button')) {
      let ids = [...this.chosenTagsList.querySelectorAll('button')].map(tag => tag.dataset.id);

      [...this.contactPageTagList.querySelectorAll('button')].forEach(btn => {
        if (ids.includes(btn.dataset.id)) {
          btn.classList.add('hidden')
        }
      })
    }
  }

  renderContactsByTag(id, contacts, currentTags) {
    let strTag;
    this.contactsContainer.innerHTML = '';

    contacts.forEach(contact => {
      if (contact.tags) {
        strTag = contact.tags;
        let arr = contact.tags.split(',');
        let matches = this.getMatchingTags(arr, currentTags);

        if (matches.map(tag => tag.id).includes(id)) {
          contact.tags = matches;
          this.contactsContainer.insertAdjacentHTML('beforeend', this.templates['contact'](contact));
        }
      }

      contact.tags = strTag;
    })
  }

  showClearButton() {
    document.querySelector('.clear').classList.remove('hidden')
  }

  hideClearButton() {
    document.querySelector('.clear').classList.add('hidden')
  }

  bindTagManagerLink() {
    document.querySelector('.add-tag').addEventListener('click', this.displayTagManager.bind(this))
  }

  bindTagManagerClick(handler) {
    this.tagsContainer.addEventListener('click', handler)
  }

  bindFormLink(handler) {
    document.querySelector('.add-contact').addEventListener('click', handler)
  }

  bindFormClick(handler) {
    this.mainForm.addEventListener('click', handler)
  }

  bindMainContactPageClick(handler) {
    document.querySelector('ul.contacts-container').addEventListener('click', handler)
  }

  bindPromptActions(handler) {
    document.querySelector('div.actions').addEventListener('click', handler)
  }

  bindClearTagClick(handler) {
    document.querySelector('.clear').addEventListener('click', handler)
  }

  bindSearchInput(handler) {
    document.querySelector('.contact-name-search').addEventListener('input', handler)
  }

  resetForm(form) {
    form.reset()
  }
}


class Constructor {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.renderHomePage();
    this.bindEvents()
  }

  async renderHomePage() {
    let contacts = await this.model.getContacts();
    
    if (contacts.length > 0) {
      this.view.renderAllContacts(contacts, this.model.tags)
    } else {
      this.view.contactsContainer.innerHTML = ''
      this.view.showEmptyContactsPlaceholder()
    }
  }

  bindEvents() {
    this.view.bindTagManagerLink();
    this.view.bindTagManagerClick(this.handleTagManagerPage.bind(this));
    this.view.bindFormLink(this.displayNewContactForm.bind(this));
    this.view.bindFormClick(this.handleFormPage.bind(this));
    this.view.bindMainContactPageClick(this.handleMainPageClick.bind(this));
    this.view.bindPromptActions(this.handlePromptActions.bind(this));
    this.view.bindClearTagClick(this.clearTags.bind(this));
    this.view.bindSearchInput(this.handleSearchBox.bind(this))
  }

  async handleMainPageClick(e) {
    e.preventDefault();
    let target = e.target;
    this.contactID = target.dataset.id

    if (target.classList.contains('delete-contact')) {
      this.view.showDeletePrompt();
    }

    if (target.classList.contains('edit-contact')) {
      this.displayEditContactPage()
    }

    if (target.classList.contains('tag-value')) {
      let tagID = target.closest('button').dataset.id;
      let contacts = await this.model.getContacts()
      this.view.renderContactsByTag(tagID, contacts, this.model.tags);
      this.view.showClearButton()
    }
  }

  async handleTagManagerPage(e) {
    e.preventDefault()
    let target = e.target

    if (target.id === 'done') {
      this.view.hideTagManagerPage();

      let contacts = await this.model.getContacts();

      this.view.renderAllContacts(contacts, this.model.tags);
      this.view.resetForm(document.querySelector('#tag-form'));
      this.renderHomePage()
    }

    if (target.id === 'submit') {
      let input = document.querySelector('#tag-input').value.trim()
      this.model.addTag(input);
      this.displayTagPageTags()
    }

    if (target.id === 'tag-close') {
      this.model.deleteTag(target.closest('button').dataset.id);
      this.displayTagPageTags()
    }
  }

  handleFormPage(e) {
    e.preventDefault();
    let target = e.target;
    let form = e.currentTarget;
    
    if (form.dataset.page_type === 'new_contact' && target.id === 'sub-contact') {
      this.processNewContact(form)
    } else if (form.dataset.page_type === 'edit_contact' && target.id === 'sub-contact') {
      this.processEditContact(form)
    }
    
    if (target.id === 'cancel') {
      this.view.hideNewContactForm();
      this.renderHomePage()
      form.reset()
    }   

    if (target.className === 'tag-button') {
      let tagID = target.dataset.id
      this.view.displayChosenTag(this.model.tags, tagID);
      target.classList.add('hidden')
    }

    if (target.id === 'tag-close') {
      let tagID = target.closest('button').dataset.id;
      this.view.removeChosenTag(tagID);
      this.view.displayTagLabel(tagID);
    }

  }
 
  processEditContact(form) {
    if (!this.model.checkValid(form)) {
      this.view.markInvalidInputs()
    } 

    if (this.model.checkValid(form)) {
      console.log('edit')
      let contact = this.getInputData();
      contact.id = Number(this.contactID);
      this.model.updateContact(contact);
      this.renderHomePage()
      this.view.hideNewContactForm()
      form.reset()
      this.renderHomePage()
    }    
  }

  processNewContact(form) {
    if (!this.model.checkValid(form)) {
      this.view.markInvalidInputs()
    } 

    if (this.model.checkValid(form)) {
      let contact = this.getInputData()
      this.model.addNewContact(contact);
      this.renderHomePage()
      this.view.hideNewContactForm()
      form.reset()
    }    
  }

  getInputData() {
    let obj = {};

    [...this.view.mainForm.querySelectorAll('input')].forEach(inp => {
      let val = inp.value;
      if (inp.dataset.input === 'name') {
        obj.full_name = val;
      } else if (inp.dataset.input === 'email') {
        obj.email = val;
      } else if (inp.dataset.input === 'phone') {
        obj.phone_number = val;
      }
    })


    if (this.view.chosenTagsList.querySelector('button')) {
      obj.tags = [...this.view.chosenTagsList.querySelectorAll('span.tag-value')].map(span => span.textContent.trim()).join(',')
    }
    
    return obj;
  }

  handlePromptActions(e) {
    e.preventDefault();
    let target = e.target;

    if (target.className === 'confirm_no') {
      this.view.hideDeletePrompt();
    }

    if (target.className === 'confirm_yes') {
      this.model.deleteContact(this.contactID);
      this.view.hideDeletePrompt()
      this.renderHomePage()
    }
  }

  displayTagPageTags() {
    this.view.displayAllTags(this.model.tags, document.querySelector('#tag-manager-list'));
  }

  displayNewContactForm(e) {
    e.preventDefault();
    this.view.hideEmptyContactsPlaceHolder()
    this.view.formContainer.querySelector('.page-header').textContent = 'Add Contact';
    this.view.mainForm.dataset.page_type = 'new_contact'

    if (this.view.mainForm.dataset.page_type === 'new_contact') {
      this.view.chosenTagsList.innerHTML = '';
      this.view.displayAllTagsLabels(this.model.tags, document.querySelector('ul.contact-tags-list'))
      this.view.formContainer.classList.remove('hidden');
      this.view.hideAllContacts();
      this.view.hideTopRow()    
    }
  }

  async displayEditContactPage() {
    this.view.hideEmptyContactsPlaceHolder()
    this.view.formContainer.querySelector('.page-header').textContent = 'Edit Contact';
    this.view.mainForm.dataset.page_type = 'edit_contact'

    if (this.view.mainForm.dataset.page_type === 'edit_contact') {
      let singleContact = await this.model.getContact(this.contactID);
      this.view.chosenTagsList.innerHTML = ''
      this.view.renderEditContactInfo(singleContact, this.model.tags);  
      this.view.displayAllTagsLabels(this.model.tags, document.querySelector('ul.contact-tags-list'))
      this.view.displayAvailableTags(this.model.tags)
      this.view.formContainer.classList.remove('hidden');
      this.view.hideAllContacts();
      this.view.hideTopRow()
    }
  }

  clearTags(e) {
    e.preventDefault();
    this.renderHomePage();
    this.view.hideClearButton()
  }

  async handleSearchBox(e) {
    let input = e.target.value.toLowerCase();

    let contacts = await this.model.getContacts();
    console.log(contacts)

    let filteredConts = contacts.filter((contact) => contact.full_name.toLowerCase().indexOf(input) !== -1);

    this.view.renderAllContacts(filteredConts, this.model.tags)
  }

}

document.addEventListener('DOMContentLoaded', () => {
  new Constructor(new Model(), new View())
})