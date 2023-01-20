class Model {
  #uniqueID;
  constructor() {
    this.#uniqueID = 0;
    this.tags = [];
  }

  addContact(contact) {
    try {
      fetch('/api/contacts/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contact),
      }) 
    } catch(error) {
      console.log(error)
    }
  }

  updateContact(contact) {
    try {
      fetch('/api/contacts/' + contact.id, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(contact),
      })
    } catch (error) {
      console.log(error)
    }
  }

  deleteContact(id) {
    try {
      fetch('/api/contacts/' + id, {
        method: 'DELETE'
      })
    } catch (error) {
      console.log(error)
    }
  }
  
  async getContact(id) {
    try {
      let data = await fetch('/api/contacts/' + id).then((res) => res.json())
      return data;
    } catch (error) {
      console.log(error)
    }
  }


  async getAllContacts() {
    try {
      let data = await fetch('/api/contacts/').then((res) => res.json())
      return data;     
    } catch (error) {
      console.log(error)
    }
  }

  addTag(input) {
    let tag = {};
    this.#uniqueID += 1;
    tag.id = String(this.#uniqueID);
    tag.value = input;

    if (this.tags.length === 0) {
      this.tags.push(tag);
      return;
    }

    if (this.tags.length > 0 && this.tags.map(tag => tag.value).indexOf(tag.value) === -1) {
      this.tags.push(tag)
    }
  }

  removeTag(id) {
    this.tags = this.tags.filter(tag => tag.id !== id)
  }


  getChosenTag(id) {
    return this.tags.filter(tag => tag.id === id);
  }

}

class View {
  constructor() {
    this.templates = this.createTemplates()
    this.topRow = document.querySelector('.row');
    this.contactsContainer = document.querySelector('.contacts-container');
    this.emptyPlaceholder = document.querySelector('.empty-contacts-placeholder');
    this.formContainer = document.querySelector('.form-container');
    this.form = this.formContainer.querySelector('form');
    this.tagManagerContainer = document.querySelector('.tags-container');
    this.allTags = document.querySelector('#tag-manager-list');
    this.tagManagerForm = document.querySelector('#tag-form');
    this.formCurrentTagsList = this.form.querySelector('.contact-tags-list');
    this.formChosenTags = this.form.querySelector('ul.chosen-tags');
    this.editFormInputs = this.form.querySelectorAll('input');
    this.overlay = document.querySelector('.overlay');
    this.prompt = document.querySelector('.confirm_prompt');
    this.clearBtn = document.querySelector('.clear');
    this.inputBox = document.querySelector('.contact-name-search');
    this.noMatchPlaceholder = document.querySelector('.no-matches')
  }

  showNoMatches() {
    this.noMatchPlaceholder.classList.remove('hidden');
  }

  hideNoMatches() {
    this.noMatchPlaceholder.classList.add('hidden');
  }

  hideTopRow() {
    this.topRow.classList.add('hidden');
  }

  showTopRow() {
    this.topRow.classList.remove('hidden');
  }

  hideEmptyPlaceholder() {
    this.emptyPlaceholder.classList.add('hidden')
  }

  showEmptyPlaceholder() {
    this.emptyPlaceholder.classList.remove('hidden')
  }

  hideContacts() {
    this.contactsContainer.classList.add('hidden')
  }

  showContacts() {
    this.contactsContainer.classList.remove('hidden')
  }

  displayTagManager() {
    this.tagManagerContainer.classList.remove('hidden');
    this.hideTopRow();
    this.hideContacts();
    this.hideEmptyPlaceholder();
    this.hideClearBtn()
  }

  displayForm() {
    this.formContainer.classList.remove('hidden');
    this.hideTopRow();
    this.hideContacts();
    this.hideNoMatches();
    this.hideClearBtn()
  }

  removeChosenTag(id) {
    if (this.formChosenTags.querySelector('button')) {
      [...this.formChosenTags.querySelectorAll('button')].forEach(btn => {
        if (btn.dataset.id === id) {
          btn.remove()
        }
      })
    }
  }

  hideForm() {
    this.formContainer.classList.add('hidden');
    this.showTopRow();
    this.hideEmptyPlaceholder()
  }

  hideTagManager() {
    this.tagManagerContainer.classList.add('hidden');
    this.showTopRow()
  }

  hideTag(tag) {
    tag.classList.add('hidden')
  }

  showTag(tag) {
    tag.classList.remove('hidden')
  }

  displayTags(tags) {
    this.allTags.innerHTML = '';
    this.allTags.insertAdjacentHTML('beforeend', this.templates['list-tag']({listTags: tags}));
    this.resetForm(this.tagManagerForm);
  }

  setFormCurrentTags(tags) {
    this.formCurrentTagsList.innerHTML = ''
    this.formCurrentTagsList.insertAdjacentHTML('beforeend', this.templates['contact-tag']({contactTags: tags}))
  }

  async renderAllContacts(contacts, currentTags) {
    this.contactsContainer.innerHTML = '';
    let strTag;

    contacts = await contacts;

    contacts.forEach(contact => {
      this.showContacts();

      if (contact.tags) {
        strTag = contact.tags;
        contact.tags = this.getTagObjects(contact.tags.split(','), currentTags);
      }

      this.contactsContainer.insertAdjacentHTML('beforeend', this.templates['contact'](contact));
      contact.tags = strTag;
  
    })
  }

  renderEditFormContact(contact, currentTags) {
    [...this.editFormInputs].forEach(inp => {
      let field = inp.dataset.input;

      if (field === 'name') {
        inp.value = contact.full_name;
      } else if (field === 'email') {
        inp.value = contact.email
      } else if (field === 'phone') {
        inp.value = contact.phone_number
      }
    })

    if (contact.tags) {
      currentTags.forEach(tag => {
        let tagName = tag.value;
        if (contact.tags.split(',').includes(tagName)) {
          console.log(tag)
          tag = [tag]
          console.log(tag)
          this.formChosenTags.insertAdjacentHTML('beforeend', this.templates['list-tag']({listTags: tag}))
        }
      })
    }
  }

  getTagObjects(contactTags, currentTags) {
    return currentTags.filter(tag => {
      return contactTags.includes(tag.value)
    })
  }

  resetForm(form) {
    form.reset()
  }

  resetFormChosenTags() {
    this.formChosenTags.innerHTML = '';
  }

  displayDeletePrompt() {
    this.overlay.style.display = 'block';
    this.prompt.style.display = 'block';
  }

  hidePrompt() {
    this.overlay.style.display = 'none';
    this.prompt.style.display = 'none';
  }

  showClearButton() {
    this.clearBtn.classList.remove('hidden')
  }

  hideClearBtn() {
    this.clearBtn.classList.add('hidden')
  }

  bindTagManagerDisplay() {
    document.querySelector('.add-tag').addEventListener('click', this.displayTagManager.bind(this))
  }

  bindTagManagerPage(handler) {
    this.tagManagerContainer.addEventListener('click', handler)
  }

  bindNewContactDisplay(handler) {
    document.querySelector('.add-contact').addEventListener('click', handler)
  }

  bindFormPage(handler) {
    this.form.addEventListener('click', handler)
  }

  bindContainerClick(handler) {
    this.contactsContainer.addEventListener('click', handler)
  }

  bindPromptClick(handler) {
    this.prompt.addEventListener('click', handler)
  }

  bindClearBtnClick(handler) {
    this.clearBtn.addEventListener('click', handler)
  }

  bindSearchBox(handler) {
    this.inputBox.addEventListener('input', handler)
  }

  createTemplates() {
    let templates = {};

    [...document.querySelectorAll("script[type='x/text-handlebars']")].forEach(script => {
      templates[script.id] = Handlebars.compile(script.innerHTML)
    })

    Handlebars.registerPartial('mainTags', document.querySelector('#main-tag').innerHTML);

    return templates;
  }

}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.showHomePage()
    this.bindEvents();
  }

  async showHomePage() {
    let contacts = await this.model.getAllContacts();
    this.view.contactsContainer.innerHTML = '';
    this.view.hideNoMatches()
  
    if (contacts) {
      console.log('tst')
      this.addPossibleTags(contacts)
      this.view.renderAllContacts(contacts, this.model.tags);
      this.view.hideEmptyPlaceholder()
    } else {
      this.view.showEmptyPlaceholder()
    }   
  }

  handleTagManagerPage(e) {
    e.preventDefault();
    let target = e.target;

    if (target.id === 'submit') {
      let input = this.view.tagManagerContainer.querySelector('#tag-input').value;

      if (input.length > 0) { this.model.addTag(input) };

      if (this.model.tags.length > 0) { this.view.displayTags(this.model.tags) };
      
    }

    if (target.id === 'tag-close') {
      this.model.removeTag(target.closest('button').dataset.id);
      this.view.displayTags(this.model.tags);
    }

    if (target.id === 'done') {
      this.view.hideTagManager();
      this.showHomePage()
    }
  }

  createNewContactForm(e) {
    e.preventDefault();
    this.view.formContainer.querySelector('h2.page-header').textContent = 'Add Contact';
    this.view.form.dataset.form = 'new-contact';
    this.view.resetFormChosenTags()
    this.view.setFormCurrentTags(this.model.tags);
    this.view.displayForm();
    this.view.hideEmptyPlaceholder()
  }

  async createEditForm(target) {
    this.view.formContainer.querySelector('h2.page-header').textContent = 'Edit Contact';
    this.view.form.dataset.form = 'edit-contact';
    this.view.formChosenTags.innerHTML = '';
    this.editId = target.dataset.id;
    let contact = await this.model.getContact(this.editId);
    this.addPossibleTags([contact]);
    this.view.renderEditFormContact(contact, this.model.tags)
    this.view.setFormCurrentTags(this.model.tags);
    this.hideChosenTags()
    this.view.displayForm();
    this.view.hideEmptyPlaceholder();
    this.view.hideClearBtn();
    this.view.inputBox.value = ''
  }

  hideChosenTags() {
    if (this.view.formChosenTags.querySelector('button')) {
      let ids = [...this.view.formChosenTags.querySelectorAll('button')].map(btn => btn.dataset.id);

      [...this.view.formCurrentTagsList.querySelectorAll('button')].forEach(btn => {
        console.log(btn)
        if (ids.indexOf(btn.dataset.id) !== -1) {
          this.view.hideTag(btn)
        }
      })
    }
  }

  handleForm(e) {
    e.preventDefault();
    let target = e.target;

    if (target.id === 'sub-contact' && this.view.form.dataset.form === 'new-contact') { this.handleNewContactSubmit() }
    if (target.id === 'sub-contact' && this.view.form.dataset.form === 'edit-contact') { this.handleEditContactSubmit() }

    if (target.id === 'cancel') {
      this.view.hideForm();
      this.view.resetForm(this.view.form);
      this.showHomePage()
    }

    if (target.classList.contains('tag-button')) {
      let id = target.dataset.id;
      console.log(id)
      this.view.hideTag(target); 
      this.addToChosenTags(id);
    }

    if (target.id === 'tag-close') {
      let id = target.closest('button').dataset.id;
      this.view.showTag([...this.view.formCurrentTagsList.querySelectorAll('button')].filter(btn => btn.dataset.id === id)[0]);
      this.view.removeChosenTag(id)
    }
  }

  addToChosenTags(id) {
    let chosenTag = this.model.getChosenTag(id);
    this.view.formChosenTags.insertAdjacentHTML('beforeend', this.view.templates['list-tag']({listTags: chosenTag}))
  }

  async handleEditContactSubmit() {
    let inputs = this.view.form.querySelectorAll('input');

    let isValid = this.checkValidity(inputs);

    if (isValid) {
      let contactObj = this.compileContactInfo(inputs);
      contactObj.id = this.editId;
      if (!contactObj.tags) { contactObj.tags = null }
      this.model.updateContact(contactObj);
      let contacts = await this.model.getAllContacts()
      this.view.renderAllContacts(contacts, this.model.tags);
      this.view.hideForm();
      this.view.resetForm(this.view.form);
      this.showHomePage()
    }
  }

  async handleNewContactSubmit() {

    let inputs = this.view.form.querySelectorAll('input');

    let isValid = this.checkValidity(inputs);

    if (isValid) {
      let contactObj = this.compileContactInfo(inputs);
      this.model.addContact(contactObj);
      let contacts = await this.model.getAllContacts();
      this.addPossibleTags(contacts)
      this.view.renderAllContacts(contacts, this.model.tags);
      this.view.hideForm();
      this.view.resetForm(this.view.form);
      this.showHomePage()
    }
  }

  async addPossibleTags(contacts) {
    contacts = await contacts;

    contacts.forEach(contact => {
      if (contact.tags) {
        contact.tags.split(',').forEach(tag => {
          if (this.model.tags.map(tag => tag.value).indexOf(tag) === -1) {
            this.model.addTag(tag);
            this.view.displayTags(this.model.tags)
          }
        })
       }    
    })
  }

  compileContactInfo(inputs) {
    let contact = {};

    [...inputs].forEach(inp => {
      let field = inp.dataset.input;
      if (field === 'name') {
        contact.full_name = inp.value;
      } else if (field === 'email') {
        contact.email = inp.value;
      } else if (field === 'phone') {
        contact.phone_number = inp.value;
      }
    })

    if (this.view.formChosenTags.querySelector('button')) {
      let tags = [...this.view.formChosenTags.querySelectorAll('button')].map(btn => btn.querySelector('span.tag-value').textContent)
      contact.tags = tags.join(',')
    }


    return contact;
  }

  checkValidity(inputs) {
    return [...inputs].every(inp => inp.checkValidity())
  }

  handleMainPage(e) {
    e.preventDefault();
    let target = e.target;

    if (target.classList.contains('edit-contact') || target.parentNode.classList.contains('edit-contact')) {
      if (target.parentNode.classList.contains('edit-contact')) { target = target.parentNode }
        this.createEditForm(target)
    }
    if (target.classList.contains('delete-contact')) { 
      this.deleteID = target.dataset.id;
      this.view.displayDeletePrompt() 
    }

    if (target.classList.contains('contact-button') || target.parentNode.classList.contains('contact-button')) {
      if (target.classList.contains('contact-button')) { target = target.parentNode }
        this.renderByTagName(target.textContent.trim());
        this.view.showClearButton()
    }
  }

  async renderByTagName(name) {
    let contacts = await this.model.getAllContacts();

    contacts = contacts.filter(contact => {
      return contact.tags && contact.tags.split(',').indexOf(name) !== -1
    })

    this.view.renderAllContacts(contacts, this.model.tags)
  }

  handlePromptClicks(e) {
    e.preventDefault();
    let target = e.target;

    if (target.classList.contains('confirm_no')) { 
      console.log('what')
      this.view.hidePrompt() 
    };
    if (target.classList.contains('confirm_yes')) { this.removeContact() }
  }

  removeContact() {
    this.model.deleteContact(this.deleteID);
    this.showHomePage();
    this.view.hideClearBtn()
    this.view.hidePrompt();
  }

  resetPage(e) {
    e.preventDefault();
    this.showHomePage();
    this.view.hideClearBtn()
  }

  async handleInput(e) {
    let target = e.target;
    let value = target.value;
    let matches = await this.getNameMatches(value)

    if (matches.length === 0) {
      this.view.contactsContainer.innerHTML = '';
      this.view.showNoMatches()
    } else if (matches.length > 0) {
      this.view.hideNoMatches()
      this.view.renderAllContacts(matches, this.model.tags)
    }
  }

  async getNameMatches(value) {
    let matches = [];
    let contacts = await this.model.getAllContacts();
    
    contacts.forEach(contact => {
      if (contact.full_name.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
        matches.push(contact);
      }
    })

    return matches;
  }

  bindEvents() {
    this.view.bindTagManagerDisplay();
    this.view.bindTagManagerPage(this.handleTagManagerPage.bind(this));
    this.view.bindNewContactDisplay(this.createNewContactForm.bind(this));
    this.view.bindFormPage(this.handleForm.bind(this));
    this.view.bindContainerClick(this.handleMainPage.bind(this));
    this.view.bindPromptClick(this.handlePromptClicks.bind(this));
    this.view.bindClearBtnClick(this.resetPage.bind(this));
    this.view.bindSearchBox(this.handleInput.bind(this))
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Controller(new Model(), new View())
})