> todos

## Forms

- [ ] Allow static fields (just text)
	- Formatting
	- Optional: Allow full/partial width?

- [ ] Form Dependencies 
	- Support Basic Use Cases (Multiple OR / AND Parse)
	- Support Ranges incl. price > 100 AND < 200
	- Invoke support
		- Hide source element
		- Disable Source element

- [ ] Workflow
	- General support for locking / unlocking (TBD from Client Requirements) 

### Type Specific

#### Text
- [ ] Testing

#### Currency
- [ ] Todo

#### Date Picker
- [ ] Formatting
- [ ] Testing / Bug Fixes

#### Picklist
- [ ] All functionality
	- Toss Across UI Behavior
	- Model
	- Validation (min selected if required)
	- Unit Tests

#### Dropdown
- [ ] Testing
- [ ] Bug Fixes
- [ ] Validation?

#### Textarea
- [ ] Testing

#### WYSIWYG
- [ ] Testing
- [ ] General Functionality

## General

- [ ] Unit testing on all form types
- [ ] Unit tests on global stuff (retrieving configs etc)
- [ ] Separate out Angular-Lightning Project into Separate repos:

1) **Angular-Lightning** (Vanilla Bower Injectable Set of Angular Modules for UI Components)
2) **Angular-VF** (Platform that has simple angular structure and Build Process for Team-Projects)
3) **Standard-Parking** Deal Journey - Everything else on top

- [ ] Create "kitchen sink" for all the elements
- [ ] Sections - Hide/Show Conditionally (Or Dim / Grey Out) Depending on Reqs
- [ ] Pages - Hide/Show Conditionally


## Nice to Haves

- [ ] Get service library set up to create crud objects 
	- (like angularvf / forceng / angular-force but simpler)
	- Keep attributes from the server in attrs hash (so we can track state, only envelope real data, avoid circular references)
	- Sync methods inherit
	- ToJSON methods inherit
	- Can override most methods
	- Unit tested

- [ ] Open source project for Lightning Angular components

